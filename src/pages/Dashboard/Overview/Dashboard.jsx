import React from "react";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { orderService } from "../../../services/api/orderService";
import { bookingService } from "../../../services/api/bookingService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Loader from "../../../components/ui/Loader/Loader";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import styles from "./Dashboard.module.css";
import {
  faUtensils,
  faShoppingCart,
  faCalendar,
  faStar,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const Dashboard = () => {
  const { data: orderStats, isLoading: orderStatsLoading } = useQuery({
    queryKey: ["orderStats"],
    queryFn: () => orderService.getOrderStats(),
  });

  const { data: tableStats, isLoading: tableStatsLoading } = useQuery({
    queryKey: ["tableBookingStats"],
    queryFn: () => bookingService.getTableBookingStats(),
  });

  const { data: recentOrders, isLoading: recentOrdersLoading } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => orderService.getAllOrders({ limit: 5 }),
  });

  const isLoading =
    orderStatsLoading || tableStatsLoading || recentOrdersLoading;

  const statsCards = [
    {
      title: "Total Revenue",
      value: orderStats?.totalRevenue || 0,
      icon: faShoppingCart,
      color: "primary",
      prefix: "$",
      change: 12.5,
    },
    {
      title: "Total Orders",
      value: orderStats?.totalOrders || 0,
      icon: faUtensils,
      color: "success",
      change: 8.3,
    },
    {
      title: "Pending Bookings",
      value: tableStats?.pending || 0,
      icon: faCalendar,
      color: "warning",
    },
    {
      title: "Avg. Rating",
      value: 4.8,
      icon: faStar,
      color: "secondary",
      suffix: "/5",
    },
  ];

  const orderTrends = [
    { date: "Mon", orders: 45, revenue: 1200 },
    { date: "Tue", orders: 52, revenue: 1450 },
    { date: "Wed", orders: 48, revenue: 1350 },
    { date: "Thu", orders: 60, revenue: 1800 },
    { date: "Fri", orders: 72, revenue: 2100 },
    { date: "Sat", orders: 85, revenue: 2500 },
    { date: "Sun", orders: 65, revenue: 1900 },
  ];

  const bookingDistribution = [
    { name: "Confirmed", value: 65 },
    { name: "Pending", value: 20 },
    { name: "Cancelled", value: 10 },
    { name: "No Show", value: 5 },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <Card key={index} className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIconWrapper}>
                <FontAwesomeIcon
                  icon={stat.icon}
                  className={styles[`statIcon--${stat.color}`]}
                />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>{stat.title}</p>
                <div className={styles.statValue}>
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    decimals={stat.value % 1 ? 2 : 0}
                    prefix={stat.prefix || ""}
                    suffix={stat.suffix || ""}
                    separator=","
                  />
                </div>
                {stat.change && (
                  <div className={styles.statChange}>
                    <FontAwesomeIcon
                      icon={stat.change > 0 ? faArrowUp : faArrowDown}
                      className={
                        stat.change > 0 ? styles.changeUp : styles.changeDown
                      }
                    />
                    <span>{Math.abs(stat.change)}% from last week</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Order Trends</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Booking Distribution</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} bookings`, "Count"]}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className={styles.recentActivity}>
        <div className={styles.activityHeader}>
          <h3 className={styles.activityTitle}>Recent Orders</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className={styles.activityTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Order ID</div>
            <div className={styles.tableCell}>Customer</div>
            <div className={styles.tableCell}>Amount</div>
            <div className={styles.tableCell}>Status</div>
            <div className={styles.tableCell}>Date</div>
          </div>

          {recentOrders?.data?.map((order) => (
            <div key={order._id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <span className={styles.orderId}>#{order.orderNumber}</span>
              </div>
              <div className={styles.tableCell}>
                {order.customer?.name || "Guest"}
              </div>
              <div className={styles.tableCell}>
                ${order.totalAmount.toFixed(2)}
              </div>
              <div className={styles.tableCell}>
                <StatusBadge status={order.status} type="order" />
              </div>
              <div className={styles.tableCell}>
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
