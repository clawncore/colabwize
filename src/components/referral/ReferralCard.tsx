import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  Clock,
  CheckCircle2,
  Loader2,
  Trophy
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import ConfigService from "../../services/ConfigService";

const API_BASE_URL = ConfigService.getApiUrl();

interface Referral {
  id: string;
  referredAt: string;
  status: string;
  expiresAt: string | null;
  refereeName: string | null;
  refereeEmail: string;
}

interface ReferralData {
  success: boolean;
  referralCode: string | null;
  totalReferrals: number;
  activeRewards: number;
  totalDaysEarned: number;
  referrals: Referral[];
}

const ReferralCard: React.FC = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem("token") || 
                   sessionStorage.getItem("token") || 
                   (window as any).__AUTH_TOKEN__;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/referrals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch referral data");
      }

      const data = await response.json();
      if (data.success) {
        setReferralData(data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralUrl = () => {
    if (!referralData?.referralCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralData.referralCode}`;
  };

  const copyToClipboard = async () => {
    const url = getReferralUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    const url = getReferralUrl();
    const text = `Join me on ColabWize - the academic integrity platform that helps researchers write with confidence. Get started with my referral link!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join ColabWize",
          text,
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!referralData?.referralCode) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Refer & Earn</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-xl font-bold">{referralData.totalReferrals}</div>
            <div className="text-xs text-muted-foreground">Referrals</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <div className="text-xl font-bold">{referralData.activeRewards * 5}</div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-xl font-bold">{referralData.totalDaysEarned}</div>
            <div className="text-xs text-muted-foreground">Total Days</div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={getReferralUrl()}
              readOnly
              className="flex-1 bg-muted"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareReferral}
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with friends. When they sign up, you both get rewards!
          </p>
        </div>

        {/* How it works */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Reward</Badge>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              5 Days of Plus Free
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300">
            For each friend who signs up using your link, you get 5 days of Plus plan 
            with unlimited scans, AI features, and priority support.
          </p>
        </div>

        {/* Recent Referrals */}
        {referralData.referrals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Referrals</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {referralData.referrals.slice(0, 5).map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      {referral.refereeName?.charAt(0) || referral.refereeEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[120px]">
                      {referral.refereeName || referral.refereeEmail}
                    </span>
                  </div>
                  <Badge 
                    variant={referral.status === "granted" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {referral.status === "granted" ? "Rewarded" : referral.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
