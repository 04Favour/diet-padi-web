import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string | null;
  isClient?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
  message_type?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

const Messages = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const fetchTeamMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch all clients belonging to this provider
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, full_name, condition, provider_id")
        .eq("provider_id", user.id)
        .eq("status", "Active");

      // Fetch all other providers (team members)
      const { data: roleRes } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "provider");

      const providerIds = (roleRes?.map((r) => r.user_id) || []).filter(
        (id) => id !== user.id,
      );

      const { data: providerProfiles } =
        providerIds.length > 0
          ? await supabase
              .from("profiles")
              .select("user_id, full_name, specialty, avatar_url")
              .in("user_id", providerIds)
          : { data: [] };

      const clientMembers: TeamMember[] = (clientsData || []).map((c) => ({
        id: c.id, // client row id (not user_id)
        name: c.full_name,
        specialty: c.condition || "Client",
        avatar_url: null,
        isClient: true,
      }));

      const providerMembers: TeamMember[] = (providerProfiles || []).map(
        (p) => ({
          id: p.user_id,
          name: p.full_name || "Unknown",
          specialty: p.specialty || "Provider",
          avatar_url: p.avatar_url,
          isClient: false,
        }),
      );

      const allMembers = [...clientMembers, ...providerMembers];
      setTeamMembers(allMembers);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedMember) return;
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedMember.id}),and(sender_id.eq.${selectedMember.id},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, [user, selectedMember]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !user || !selectedMember || sendingMessage) {
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedMember.id,
        content: messageInput,
        message_type: "text",
      });

      if (error) throw error;
      setMessageInput("");
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  }, [messageInput, user, selectedMember, sendingMessage, fetchMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Effects
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  useEffect(() => {
    if (teamMembers.length === 0) return;
    const state = location.state as { contactId?: string } | null;
    if (state?.contactId) {
      const match = teamMembers.find((m) => m.id === state.contactId);
      if (match) setSelectedMember(match);
    }
  }, [teamMembers, location.state]);

  useEffect(() => {
    if (selectedMember && user) {
      fetchMessages();
      // Set up real-time subscription
      const subscription = supabase
        .channel(`messages_${selectedMember.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedMember.id}),and(sender_id=eq.${selectedMember.id},receiver_id=eq.${user.id}))`,
          },
          () => {
            fetchMessages();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedMember, user, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-primary">
        Messages
      </h1>

      <div className="grid gap-4 lg:grid-cols-3 min-h-[500px]">
        {/* Team Members List */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No team members found
              </div>
            ) : (
              filtered.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedMember?.id === member.id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {member.isClient ? "Client" : "Provider"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedMember && (
          <div className="flex flex-col rounded-xl border border-border bg-card lg:col-span-2">
            {/* Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(selectedMember.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedMember.name}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {selectedMember.isClient ? "Client" : "Provider"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground text-center">
                    Start a conversation with {selectedMember.name}
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      {msg.attachment_url && (
                        <div className="mt-2">
                          {msg.attachment_url.includes("/images/") ? (
                            <img
                              src={msg.attachment_url}
                              alt={msg.attachment_name || "Image"}
                              className="max-w-xs rounded"
                            />
                          ) : (
                            <a
                              href={msg.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline"
                            >
                              {msg.attachment_name || "Download"}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <button className="rounded-lg border border-input bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
