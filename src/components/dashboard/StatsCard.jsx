import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  blue: "from-blue-500 to-blue-600 text-blue-600",
  green: "from-green-500 to-emerald-600 text-green-600",
  purple: "from-purple-500 to-purple-600 text-purple-600",
  orange: "from-orange-500 to-orange-600 text-orange-600",
  pink: "from-pink-500 to-rose-600 text-pink-600"
};

const StatsCard = React.memo(function StatsCard({ title, value, change, changeType, icon: Icon, color = "blue", description }) {
  const classes = colorClasses[color];
  const gradientClasses = classes.split(' ').slice(0, 2).join(' ');
  const textClass = classes.split(' ')[2];

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${gradientClasses} opacity-5 rounded-full transform translate-x-8 -translate-y-8`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClasses} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${textClass} select-none`} />
        </div>
      </CardHeader>
      <CardContent>
        {change && (
          <div className="flex items-center space-x-2">
            {changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-green-500 select-none" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180 select-none" />
            )}
            <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">vs last month</span>
          </div>
        )}
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
});

export default StatsCard;