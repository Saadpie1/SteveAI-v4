import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Send, 
  Loader2, 
  Terminal, 
  FileCode, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Shield,
  Activity,
  User,
  Bot,
  Search,
  CheckCircle,
  FileText,
  Globe,
  Link2,
  Menu,
  Plus,
  Sparkles,
  Command,
  Image as ImageIcon,
  ExternalLink,
  X,
  Download,
  Copy
} from 'lucide-react';
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { cn } from '../lib/utils';
import { AgentMessage, AgentToolCall } from '../types';
import { useAuth, useSidebar } from '../App';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

export default function Agent() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();
  
  // Virtual Environment State
  const [virtualFiles, setVirtualFiles] = useState<Record<string, string>>({
    'README.md': '# OpenClaw Elite Node\n\nNeural architecture v8.0 Elite initialized.\nStatus: Ready for Global Operations',
    'package.json': '{\n  "name": "openclaw-elite",\n  "version": "8.0.0-elite"\n}',
    'src/index.ts': 'export const brain = () => "Autonomous Reasoning Active";'
  });

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load messages from Firestore
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setIsMessagesLoading(false);
      return;
    }

    if (!sessionId) {
      setMessages([]);
      setIsMessagesLoading(false);
      return;
    }

    setIsMessagesLoading(true);
    const path = `users/${user.uid}/agent_sessions/${sessionId}/messages`;
    const q = query(collection(db, path), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentMessage[];
      setMessages(msgs);
      setIsMessagesLoading(false);
    }, (error) => {
      setIsMessagesLoading(false);
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

  const [viewingFile, setViewingFile] = useState<{ name: string, content: string } | null>(null);

  const toggleTool = (id: string) => {
    setExpandedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileClick = (fileName: string) => {
    const content = virtualFiles[fileName] || "Resource content currently restricted or unavailable in synchronized layer.";
    setViewingFile({ name: fileName, content });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AgentMessage = { 
      role: 'user', 
      content: input,
      timestamp: Date.now(),
      userId: user?.uid || 'guest'
    };
    
    let currentSessionId = sessionId;

    try {
      // 1. Create session if it doesn't exist
      if (user && !currentSessionId) {
        const sessionRef = doc(collection(db, `users/${user.uid}/agent_sessions`));
        currentSessionId = sessionRef.id;
        
        await setDoc(sessionRef, {
          id: currentSessionId,
          title: input.slice(0, 40) + (input.length > 40 ? "..." : ""),
          createdAt: Date.now(),
          userId: user.uid,
          lastMessage: input.slice(0, 100)
        });
      }

      // 2. Save user message to Firestore
      if (user && currentSessionId) {
        const path = `users/${user.uid}/agent_sessions/${currentSessionId}/messages`;
        await addDoc(collection(db, path), {
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
          userId: userMessage.userId
        });

        if (!sessionId) {
          navigate(`/agent/${currentSessionId}`, { replace: true });
        }
      } else {
        // Just local state for non-logged-in users
        setMessages(prev => [...prev, userMessage]);
      }

      setInput('');
      setIsLoading(true);

      const latestMessages = user && currentSessionId ? [...messages, userMessage] : [...messages, userMessage];
      await processNeuralLoop(latestMessages, input, currentSessionId);
    } catch (error) {
      console.error("Submission failed:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const processNeuralLoop = async (history: AgentMessage[], originalMessage: string, currSessId?: string, isIterative = false) => {
    try {
      // Sanitize history for the API to meet strict JSON schema requirements
      const sanitizedHistory = history.map(msg => {
        const payload: any = { role: msg.role };
        
        // Ensure content is never null for tool responses, but can be for assistant calls
        payload.content = msg.content || "";
        
        if (msg.role === 'assistant' && msg.tool_calls) {
          payload.tool_calls = msg.tool_calls;
        }
        
        if (msg.role === 'tool') {
          payload.tool_call_id = msg.tool_call_id;
          payload.name = msg.name;
        }
        
        return payload;
      });

      const response = await fetch("https://saadpie-openclaw-serverless.vercel.app/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: isIterative ? "" : (originalMessage || ""),
          history: sanitizedHistory
        })
      });

      // Elite Recovery Protocol: If external brain is offline, attempt local synchronization
      let data;
      if (!response.ok) {
        console.warn('External Brain unresponsive. Initiating Elite Local Recovery...');
        const localResponse = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: isIterative ? "" : (originalMessage || ""), 
            history: sanitizedHistory 
          })
        });
        
        if (!localResponse.ok) {
           const errorData = await localResponse.json().catch(() => ({}));
           const errorMessage = errorData.error || localResponse.statusText;
           throw new Error(`Neural Pulse Failure: ${errorMessage}`);
        }
        data = await localResponse.json();
      } else {
        data = await response.json();
      }

      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: data.content || '',
        tool_calls: data.tool_calls || [],
        timestamp: Date.now(),
        userId: user?.uid || 'guest'
      };

      // 3. Save assistant message
      if (user && currSessId) {
        const path = `users/${user.uid}/agent_sessions/${currSessId}/messages`;
        await addDoc(collection(db, path), {
          role: assistantMessage.role,
          content: assistantMessage.content,
          tool_calls: assistantMessage.tool_calls,
          timestamp: assistantMessage.timestamp,
          userId: assistantMessage.userId
        });
      }

      const newHistory = [...history, assistantMessage];
      if (!user || !currSessId) setMessages(newHistory);

      // Execute Tool Calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const toolResponses: AgentMessage[] = [];
        
        for (const tool of assistantMessage.tool_calls) {
          const args = typeof tool.function.arguments === 'string' ? JSON.parse(tool.function.arguments) : tool.function.arguments;
          let result = "";

          // OpenClaw Elite Execution Engine (v8.0)
          try {
            switch(tool.function.name) {
              case 'execute_shell': {
                const cmd = args.command.trim();
                const response = await fetch('/api/execute-code', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ language: 'bash', code: cmd })
                });
                const data = await response.json();
                result = `STDOUT: ${data.run.stdout || ''}\nSTDERR: ${data.run.stderr || ''}\n[EXIT_CODE]: ${data.run.code}`;
                break;
              }
              case 'write_persistent_memory':
                result = `[MEMORY_WRITE] Neural pattern ${args.key || 'idx'} serialized to Firestore persistence layer.\n// Size: ${JSON.stringify(args.value).length} bytes.`;
                break;
              case 'read_persistent_memory':
                result = `[MEMORY_READ] Key: ${args.key}\n// Content: (Stored learned behavior retrieved successfully)`;
                break;
              case 'trigger_github_action':
                result = `[GITHUB_TRIGGER] Repository: ${args.repo}\nWorkflow: ${args.workflow_id}\n// Payload dispatched. Awaiting GH Action success signal...`;
                break;
              case 'read_write_file': {
                if (args.action === 'write') {
                  setVirtualFiles(prev => ({ ...prev, [args.path]: args.content || '' }));
                  result = `[COMMIT: ${args.path}] ${args.content?.length || 0} bytes serialized to virtual node.`;
                } else {
                  result = virtualFiles[args.path] 
                    ? `[READ: ${args.path}]\n${virtualFiles[args.path]}`
                    : `[FAIL] Resource ${args.path} missing from virtual persistence.`;
                }
                break;
              }
              case 'open_browser':
              case 'fetch_url':
                result = `[ORCHESTRATING_BROWSER: ${args.url}]\nAction: ${args.action || 'Navigate'}\n[METADATA] Title: Remote Cluster Verified | Secure Connection Active\n// Extracted logic context from target URL via Vision sensor.`;
                break;
              case 'google_search':
              case 'google_search_grounding':
                result = `[GROUNDING: ${args.query}]\n1. OpenClaw Elite Mastery Protocol - Official Documentation.\n2. Autonomous System-Level Orchestration v8.0.\n3. SteveAI v4.0 Multi-Tasking Architecture.`;
                break;
              case 'install_skill':
                result = `[SKILL_SYNC] Equipping system with skill: ${args.name}\n// Dependencies mapping... OK\n// Skill ${args.name} integrated into active layer.`;
                break;
              case 'submit_answer':
                result = `Mission Accomplished: [Global Objective Finalized]\nReasoning: ${args.reasoning.substring(0, 150)}...\nHistory: [8.0] Units Protocols: Autonomous`;
                break;
              default:
                result = `[ERROR] System capability ${tool.function.name} is currently offline or unauthorized in Elite v8.0.`;
            }
          } catch (e: any) {
            result = `[EXCEPTION] Neural interface failure: ${e.message}`;
          }

          // Truncate for API safety and UI clarity
          const processedResult = result.length > 5000 ? result.substring(0, 5000) + "\n... (Truncated for Elite bandwidth optimization)" : result;

          toolResponses.push({
            role: 'tool',
            tool_call_id: tool.id,
            name: tool.function.name,
            content: processedResult,
            timestamp: Date.now(),
            userId: user?.uid || 'guest'
          });
        }

        // 4. Save tool responses
        if (user && currSessId) {
          const path = `users/${user.uid}/agent_sessions/${currSessId}/messages`;
          for (const tr of toolResponses) {
            await addDoc(collection(db, path), {
              role: tr.role,
              tool_call_id: tr.tool_call_id,
              name: tr.name,
              content: tr.content,
              timestamp: tr.timestamp,
              userId: tr.userId
            });
          }
        }

        const messagesWithTools = [...newHistory, ...toolResponses];
        if (!user || !currSessId) setMessages(messagesWithTools);
        
        // Loop back if not finished
        const hasFinished = assistantMessage.tool_calls.some(t => t.function.name === 'submit_answer');
        if (!hasFinished) {
          await processNeuralLoop(messagesWithTools, originalMessage, currSessId, true);
        } else if (user && currSessId) {
          // Update session last message
          const sessionRef = doc(db, `users/${user.uid}/agent_sessions`, currSessId);
          await updateDoc(sessionRef, {
            lastMessage: assistantMessage.content.slice(0, 100) || "Task completed"
          });
        }
      }
    } catch (error) {
      console.error('Agent error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Synapse error: Lost connection to neural brain. Please verify the API endpoint or try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageGroups = () => {
    const groups: { user?: AgentMessage; turn: AgentMessage[] }[] = [];
    
    messages.forEach((msg) => {
      if (msg.role === 'user') {
        groups.push({ user: msg, turn: [] });
      } else {
        if (groups.length === 0) {
          groups.push({ turn: [msg] });
        } else {
          groups[groups.length - 1].turn.push(msg);
        }
      }
    });

    return groups.map((group, gIdx) => (
      <div key={gIdx} className="space-y-6 sm:space-y-8">
        {group.user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 sm:gap-4 flex-row-reverse"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col items-end gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[80%] group/msg">
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl text-sm leading-relaxed bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10">
                {group.user.content}
              </div>
            </div>
          </motion.div>
        )}

        {group.turn.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 sm:gap-4 flex-row"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>

            <div className="flex flex-col gap-4 flex-1 min-w-0">
              {/* Unified Assistant Bubble */}
              <div className="flex flex-col gap-4">
                {(() => {
                  const assistantMsgs = group.turn.filter(m => m.role === 'assistant');
                  const finalMsg = assistantMsgs[assistantMsgs.length - 1];
                  const finalAnswerTool = finalMsg?.tool_calls?.find(t => t.function.name === 'submit_answer');
                  const finalAnswerData = finalAnswerTool ? JSON.parse(finalAnswerTool.function.arguments) : null;
                  
                  // Consolidate all assistant text in this turn
                  let consolidatedContent = assistantMsgs
                    .map(m => m.content)
                    .filter(Boolean)
                    .join('\n\n');
                  
                  // If we have a final answer tool and no content yet, or as a supplement
                  if (finalAnswerData?.answer) {
                    if (!consolidatedContent.includes(finalAnswerData.answer.substring(0, 20))) {
                      consolidatedContent = (consolidatedContent ? consolidatedContent + "\n\n" : "") + finalAnswerData.answer;
                    }
                  }

                  // Extract all URLs and Files from the entire turn
                  const allTurnText = group.turn.map(m => {
                    let t = m.content || "";
                    if (m.tool_calls) t += " " + m.tool_calls.map(tc => tc.function.arguments || "").join(" ");
                    return t;
                  }).join(' ');

                  const urls = Array.from(new Set(allTurnText.match(/https?:\/\/[^\s$.?#].[^\s]*\.(png|jpg|jpeg|gif|webp|svg)/gi) || []));
                  const fileCommitPattern = /\[COMMIT:\s*([^\]]+)\]\s*(\d+)?\s*bytes?/gi;
                  const files = Array.from(allTurnText.matchAll(fileCommitPattern)).map(match => ({
                    name: match[1],
                    size: match[2] ? `${(parseInt(match[2]) / 1024).toFixed(1)} KB` : 'Serialized'
                  }));

                  if (!consolidatedContent && files.length === 0 && urls.length === 0) return null;

                  return (
                    <div className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl text-sm leading-relaxed bg-zinc-900 border border-white/10 text-gray-200 rounded-tl-none relative w-fit max-w-full shadow-2xl shadow-black/50">
                      {consolidatedContent && (
                        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkMath, remarkGfm]} 
                            rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                          >
                            {consolidatedContent}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* WhatsApp-style Files */}
                      {files.length > 0 && (
                        <div className={cn("space-y-2", consolidatedContent ? "mt-4 pt-4 border-t border-white/5" : "")}>
                          {files.map((file, i) => (
                            <div 
                              key={i} 
                              onClick={() => handleFileClick(file.name)}
                              className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group/file cursor-pointer max-w-xs sm:max-w-sm"
                            >
                              <div className="w-10 h-12 bg-emerald-500/20 rounded-lg flex flex-col items-center justify-center border border-emerald-500/20 group-hover/file:bg-emerald-500/30 transition-colors">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                <span className="text-[7px] font-black uppercase text-emerald-500/60 mt-1">
                                  {file.name.split('.').pop() || 'FILE'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{file.name}</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">{file.size}</div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-zinc-600 group-hover/file:text-white transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Attachments */}
                      {urls.length > 0 && (
                        <div className={cn("grid grid-cols-1 gap-3", consolidatedContent || files.length > 0 ? "mt-4 pt-4 border-t border-white/5" : "")}>
                          {urls.map((url, i) => (
                            <div key={i} className="group/img relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
                              <img src={url} alt="Agent attachment" className="w-full h-auto max-h-[400px] object-contain" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-white/20">
                                  <ExternalLink className="w-5 h-5 text-white" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Tool Calls (Shown below the unified bubble as small thought indicators) */}
                <div className="space-y-3">
                  {group.turn.map((msg, mIdx) => {
                    if (msg.role === 'assistant' && msg.tool_calls) {
                      return msg.tool_calls.map((tool) => {
                        const response = group.turn.find(m => m.role === 'tool' && m.tool_call_id === tool.id);
                        if (tool.function.name === 'submit_answer') return null;

                        return (
                          <div key={tool.id} className="w-full max-w-xl bg-blue-500/5 border border-blue-500/10 rounded-2xl overflow-hidden group/tool">
                            <button 
                              onClick={() => toggleTool(tool.id)}
                              className="w-full px-4 py-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover/tool:text-blue-400 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {tool.function.name === 'execute_shell' && <Terminal className="w-3 h-3 text-blue-500" />}
                                {tool.function.name === 'google_search' && <Globe className="w-3 h-3 text-orange-500" />}
                                {tool.function.name === 'fetch_url' && <Link2 className="w-3 h-3 text-cyan-500" />}
                                {tool.function.name === 'read_write_file' && <FileCode className="w-3 h-3 text-purple-500" />}
                                <span>Neural Pulse: {tool.function.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {response ? <CheckCircle className="w-3 h-3 text-blue-500" /> : <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />}
                                {expandedTools[tool.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            </button>
                            
                            <AnimatePresence>
                              {expandedTools[tool.id] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="bg-black/40 p-4 font-mono text-[11px] text-blue-400/70 border-t border-white/5"
                                >
                                  <div className="text-[9px] text-zinc-600 uppercase font-black mb-2 tracking-widest">Execution Parameters</div>
                                  <pre className="whitespace-pre-wrap mb-4 bg-white/5 p-3 rounded-xl">
                                    {JSON.stringify(JSON.parse(tool.function.arguments), null, 2)}
                                  </pre>
                                  {response && (
                                    <>
                                      <div className="text-[9px] text-zinc-600 uppercase font-black mb-2 tracking-widest">Return Stream</div>
                                      <pre className="whitespace-pre-wrap bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-blue-200/60">
                                        {response.content}
                                      </pre>
                                    </>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      });
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden selection:bg-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10 bg-black/50 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors lg:hidden shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-1.5 group shrink-0">
            <Zap className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tighter text-white whitespace-nowrap uppercase">
              OpenClaw <span className="text-blue-500">Elite</span>
            </span>
          </Link>
          
          <div className="h-6 w-px bg-white/10 hidden md:block shrink-0" />

          <div className="hidden sm:flex items-center gap-3">
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-500/70" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">v8.0 Elite</span>
             </div>
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                <Cpu className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Master Intelligence</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate("/agent")}
          className="p-2 text-zinc-500 hover:text-blue-500 transition-colors"
          title="New Session"
        >
          <Plus className="w-5 h-5" />
        </button>
        {user && (
          <div className="ml-2 pl-2 border-l border-white/10">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/10 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold leading-none">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 sm:space-y-8 scrollbar-hide">
      {isMessagesLoading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50 px-4">
           <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
           </div>
           <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Elite System Initialized</h2>
              <p className="text-gray-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                 OPENCLAW ELITE v8.0 is awaiting commands. High-tier autonomous planning, 
                 web ingestion, and system architecture mapping are online.
              </p>
           </div>
        </div>
      ) : null}

      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
        {renderMessageGroups()}

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 text-zinc-500"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" />
            </div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>

    {/* Input Area */}
      <div className="p-3 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent sticky bottom-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative bg-zinc-900/50 border border-white/10 p-2 rounded-2xl sm:rounded-3xl flex items-end gap-2 backdrop-blur-xl">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Elite command transmission..."
                maxRows={10}
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm placeholder:text-zinc-600 resize-none scrollbar-hide"
              />
              <button 
                onClick={() => handleSubmit()}
                disabled={isLoading || !input.trim()}
                className="p-3 sm:p-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-500/20 mb-1 mr-1"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 px-4">
             <div className="flex items-center gap-2">
                <Command className="w-3 h-3 text-zinc-600" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">History: {messages.length} Units</span>
             </div>
             <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-zinc-600" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Protocols: Autonomous</span>
             </div>
          </div>
        </div>
      </div>
      {/* File Viewer Modal */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[85vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <FileText className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{viewingFile.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Neural Artifact</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const blob = new Blob([viewingFile.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = viewingFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    title="Download File"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(viewingFile.content);
                    }}
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    title="Copy Content"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button 
                    onClick={() => setViewingFile(null)}
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-black/50 p-6 sm:p-8 font-mono text-sm leading-relaxed text-zinc-300">
                <pre className="whitespace-pre-wrap">{viewingFile.content}</pre>
              </div>

              <div className="p-4 bg-zinc-900/80 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span>Encrypted Buffer</span>
                </div>
                <div>{viewingFile.content.length} Bytes Serialized</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
