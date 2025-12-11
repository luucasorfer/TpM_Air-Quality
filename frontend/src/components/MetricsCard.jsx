import React from "react";

export function MetricsCard({
  title,
  value,
  unit,
  icon: Icon,
  color = "blue",
}) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 text-blue-600 text-blue-800",
    green: "from-green-50 to-green-100 text-green-600 text-green-800",
    purple: "from-purple-50 to-purple-100 text-purple-600 text-purple-800",
    red: "from-red-50 to-red-100 text-red-600 text-red-800",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">
            {value} {unit}
          </p>
        </div>
        {Icon && <Icon className="w-8 h-8 opacity-50" />}
      </div>
    </div>
  );
}
