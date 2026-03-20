import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Search, Download, TrendingUp, Clock } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from "recharts";
import logo from "../assets/loading_img.png";
import { BounceLoader } from "react-spinners";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const BASE_URL = "http://localhost:5000/api/admin/analytics";

export default function InteractiveDashboard() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  const fetchData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    
    const params = {
      from: range.from || undefined,
      to: range.to || undefined
    };

    try {
      // Parallel execution of separate API endpoints
      const [
        usersData,
        revenueData,
        parkingStatus,
        incomeByVehicle,
        peakHours,
        popularSlots,
        paymentMethods,
        paymentStats,
        topCustomers,
        summary
      ] = await Promise.all([
        axios.get(`${BASE_URL}/users`, { params }),
        axios.get(`${BASE_URL}/revenue`, { params }),
        axios.get(`${BASE_URL}/parking-status`, { params }),
        axios.get(`${BASE_URL}/income-by-vehicle`, { params }),
        axios.get(`${BASE_URL}/peak-hours`, { params }),
        axios.get(`${BASE_URL}/popular-slots`, { params }),
        axios.get(`${BASE_URL}/payment-methods`, { params }),
        axios.get(`${BASE_URL}/payment-stats`, { params }),
        axios.get(`${BASE_URL}/top-customers`, { params }),
        axios.get(`${BASE_URL}/summary`, { params })
      ]);

      setData({
        usersData: usersData.data,
        revenueData: revenueData.data,
        parkingStatus: parkingStatus.data,
        incomeByVehicle: incomeByVehicle.data,
        peakHours: peakHours.data,
        popularSlots: popularSlots.data,
        paymentMethods: paymentMethods.data,
        paymentStats: paymentStats.data,
        topCustomers: topCustomers.data,
        summary: summary.data
      });

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
      if (isInitial) setInitialPageLoad(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData(true);
  }, []);

  console.log("Payment Methods Data:", data?.paymentMethods);

  const downloadFullReport = async () => {
    const element = document.getElementById("dashboard-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Business_Report.pdf");
  };

  if (initialPageLoad) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "80vh" }}>
        <img src={logo} alt="Logo" style={{ width: "220px", marginBottom: "20px" }} />
        <BounceLoader color="#6199ff" size={50} />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      {/* HEADER & SEARCH */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm gap-3">
        <h4 className="fw-bold m-0 text-dark">
          <TrendingUp className="me-2 text-primary" size={24}/>Business Analytics
        </h4>
        
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">From</span>
            <input type="date" className="form-control" value={range.from} onChange={(e) => setRange({...range, from: e.target.value})} />
          </div>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">To</span>
            <input type="date" className="form-control" value={range.to} onChange={(e) => setRange({...range, to: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => fetchData()} disabled={loading}>
            {loading ? "..." : <><Search size={16}/> Search</>}
          </button>
          <button className="btn btn-dark btn-sm d-flex align-items-center gap-1" onClick={downloadFullReport}>
            <Download size={16}/> Report
          </button>
        </div>
      </div>

      <div id="dashboard-content" className="row g-4">
        {/* ROW 1: USER GROWTH & STATUS */}
        <ChartCard title="User Registration Trend" md={8}>
          <AreaChart data={data?.usersData}>
            <XAxis dataKey="_id" tick={{fontSize: 10}}/>
            <YAxis tick={{fontSize: 10}}/>
            <Tooltip />
            <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        </ChartCard>
        
        <ChartCard title="Current Parking Distribution" md={4}>
          <PieChart>
            <Pie data={data?.parkingStatus} dataKey="value" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
              {data?.parkingStatus?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        {/* ROW 2: REVENUE TIMELINE & VEHICLE SPLIT */}
        <ChartCard title="Revenue Growth (Success Payments)" md={8}>
          <LineChart data={data?.revenueData}>
            <XAxis dataKey="_id" tick={{fontSize: 10}}/>
            <YAxis tick={{fontSize: 10}}/>
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Income by Vehicle Type" md={4}>
          <PieChart>
            <Pie data={data?.incomeByVehicle} dataKey="value" nameKey="_id" innerRadius={50} outerRadius={80} paddingAngle={5}>
              {data?.incomeByVehicle?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        {/* ROW 3: PEAK HOURS & POPULAR SLOTS */}
        <ChartCard title="Peak Occupancy Hours (24h)" md={6}>
          <BarChart data={data?.peakHours}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#FFBB28" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Top 10 High-Demand Slots" md={6}>
          <BarChart layout="vertical" data={data?.popularSlots}>
            <XAxis type="number" hide/>
            <YAxis dataKey="_id" type="category" width={80} tick={{fontSize: 10}}/>
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* ROW 4: PAYMENTS & TOP USERS */}
        <ChartCard title="Payment Method Popularity" md={4}>
          <PieChart>
            <Pie data={data?.paymentMethods} dataKey="count" nameKey="_id" outerRadius={70}>
              {data?.paymentMethods?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Transaction Status Ratio" md={4}>
          <BarChart data={data?.paymentStats}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count">
              {data?.paymentStats?.map((entry, i) => (
                <Cell key={i} fill={entry._id === 'SUCCESS' ? '#00C49F' : '#dc3545'} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Top 5 High-Value Customers" md={4}>
          <BarChart data={data?.topCustomers}>
            <XAxis dataKey="_id" hide />
            <YAxis />
            <Tooltip labelStyle={{fontSize: '10px'}}/>
            <Bar dataKey="total" fill="#0d6efd" />
          </BarChart>
        </ChartCard>

        {/* METRIC CARD */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 text-center rounded-4 h-100 justify-content-center">
            <Clock className="mx-auto mb-2 text-primary" size={40}/>
            <h6 className="text-muted fw-bold">Avg. Parking Session</h6>
            <h2 className="fw-bold text-dark">{data?.summary?.avgDuration?.toFixed(1) || 0} Min</h2>
            <hr />
            <div className="badge bg-success-subtle text-success p-2">
              Live Occupancy: {data?.summary?.liveOccupancy || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, md }) {
  return (
    <div className={`col-md-${md}`}>
      <div className="card border-0 shadow-sm p-3 rounded-4" style={{ minHeight: "350px" }}>
        <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: "13px", textTransform: "uppercase" }}>{title}</h6>
        <ResponsiveContainer width="100%" height={280}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}