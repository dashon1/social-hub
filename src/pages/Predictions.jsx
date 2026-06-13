import React, { useState, useEffect } from "react";
import { ContentPrediction } from "@/entities/ContentPrediction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap } from "lucide-react";

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await ContentPrediction.list("-created_date", 20);
      setPredictions(data);
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          Predictive Analytics
        </h1>
        <p className="text-slate-600">AI-powered predictions for your content performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <Brain className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm opacity-90">AI Predictions Made</p>
            <p className="text-4xl font-bold mt-2">{predictions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <Target className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm opacity-90">Average Accuracy</p>
            <p className="text-4xl font-bold mt-2">
              {predictions.length > 0 
                ? Math.round(predictions.reduce((sum, p) => sum + (p.prediction_accuracy || 0), 0) / predictions.length)
                : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <Zap className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm opacity-90">High Confidence</p>
            <p className="text-4xl font-bold mt-2">
              {predictions.filter(p => (p.confidence_score || 0) > 80).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : predictions.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Predictions Yet</h3>
            <p className="text-slate-600">Create posts to start receiving AI predictions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.map(pred => (
            <Card key={pred.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Predicted Engagement</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {pred.predicted_engagement_rate?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Predicted Reach</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(pred.predicted_reach || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Confidence Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pred.confidence_score || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                    {pred.prediction_accuracy ? (
                      <p className="text-2xl font-bold text-orange-600">
                        {pred.prediction_accuracy}%
                      </p>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}