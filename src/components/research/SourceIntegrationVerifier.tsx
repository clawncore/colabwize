import React, { useState, useEffect } from 'react';
import { SourceIntegrationService, SourceIntegrationReport } from '../../services/sourceIntegrationService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertTriangle, Info, Clock, BookOpen, StickyNote } from 'lucide-react';

interface SourceIntegrationVerifierProps {
    projectId: string;
}

const SourceIntegrationVerifier: React.FC<SourceIntegrationVerifierProps> = ({ projectId }) => {
    const [report, setReport] = useState<SourceIntegrationReport | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVerificationReport = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await SourceIntegrationService.verifySourceIntegration(projectId);
            setReport(result);
        } catch (err: any) {
            setError(err.message || 'Failed to verify source integration');
            console.error('Error verifying source integration:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch initial report when component mounts
        fetchVerificationReport();
    }, [projectId]);

    const renderRedFlags = () => {
        if (!report || !report.redFlags || report.redFlags.length === 0) {
            return (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                        No red flags detected. All sources appear to have been properly integrated.
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="space-y-3">
                {report.redFlags.map((flag, index) => (
                    <Alert key={index} className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            <div className="font-medium">{flag.flagType.replace(/_/g, ' ')}</div>
                            <div>{flag.message}</div>
                        </AlertDescription>
                    </Alert>
                ))}
            </div>
        );
    };

    const renderAuditTrail = () => {
        if (!report || !report.readingAuditTrail || report.readingAuditTrail.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No source reading activity detected. Start reading sources to build your audit trail.
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {report.readingAuditTrail.map((trail, index) => (
                    <Card key={index} className="border border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {trail.sourceId.substring(0, 50)}{trail.sourceId.length > 50 ? '...' : ''}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Time: {Math.round(trail.timeSpent / 1000)}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">Highlights: {trail.highlights}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Notes: {trail.notes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm">Citation: {trail.citationTiming}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Source Integration Verification</h2>
                <Button onClick={fetchVerificationReport} disabled={loading}>
                    {loading ? 'Verifying...' : 'Refresh Report'}
                </Button>
            </div>

            {error && (
                <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {report && (
                <div className="space-y-6">
                    <Card className="border border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Verification Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={report.isConsistentWithReading ? "default" : "destructive"}
                                        className={report.isConsistentWithReading ? "bg-green-500" : "bg-red-500"}
                                    >
                                        {report.isConsistentWithReading ? 'Consistent with Reading' : 'Issues Detected'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Authenticity Score:</span>
                                    <span className="text-lg font-bold">{report.authenticityScore}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Red Flags & Warnings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderRedFlags()}
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500" />
                                Reading Audit Trail
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderAuditTrail()}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SourceIntegrationVerifier;