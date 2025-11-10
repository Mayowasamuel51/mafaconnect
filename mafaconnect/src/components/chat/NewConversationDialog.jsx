import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/uimain/dialog";
import { Button } from "@/components/uimain/button";
import { Input } from "@/components/uimain/Input";
import { Textarea } from "@/components/uimain/textarea";
import { Label } from "@/components/uimain/label";



export function NewConversationDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewConversationDialogProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && message.trim()) {
      onSubmit(subject, message);
      setSubject("");
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
