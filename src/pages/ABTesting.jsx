import React, { useState, useEffect } from "react";
import { ABTest } from "@/entities/ABTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, TrendingUp } from "lucide-react";

export default function ABTesting() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await ABTest.list("-created_date");
      setTests(data);
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800"
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-green-600" />
            A/B Testing Lab
          </h1>
          <p className="text-slate-600">Test variations to optimize engagement</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No A/B Tests Yet</h3>
            <p className="text-slate-600 mb-6">Create your first test to discover what works best</p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <Card key={test.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{test.test_name}</CardTitle>
                  <Badge className={statusColors[test.status]}>{test.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Variant A</p>
                    <p className="text-sm text-slate-700 line-clamp-3">{test.variant_a?.content}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Variant B</p>
                    <p className="text-sm text-slate-700 line-clamp-3">{test.variant_b?.content}</p>
                  </div>
                </div>
                {test.status === "completed" && test.winner !== "pending" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">
                      Winner: Variant {test.winner.toUpperCase()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}