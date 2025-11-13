import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { FileText, Eye } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

export function AuditLogViewer() {
  const { logs, isLoading } = useAuditLogs();
  const [selectedLog, setSelectedLog] = React.useState(null);

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;
  }

  const getActionBadge = (action) => {
    const variants = {
      create: "default",
      update: "secondary",
      delete: "destructive",
    };
    return <Badge variant={variants[action] || "outline"}>{action.toUpperCase()}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>View all system activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Object Type</TableHead>
                <TableHead>Object ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-medium">{log.object_type}</TableCell>
                  <TableCell className="font-mono text-xs">{log.object_id?.substring(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs">{log.user_id?.substring(0, 8)}...</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.data && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!logs?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Action</h4>
              {selectedLog && getActionBadge(selectedLog.action)}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Object Type</h4>
              <p className="text-sm">{selectedLog?.object_type}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data</h4>
              <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {JSON.stringify(selectedLog?.data, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
