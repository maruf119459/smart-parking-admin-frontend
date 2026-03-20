import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Search, Download, TrendingUp, Clock } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";
import logo from "../assets/loading_img.png";
import { BounceLoader } from "react-spinners";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const BASE_URL = "http://localhost:5000/api/admin/analytics";

export default function InteractiveDashboard() {
  const getFormattedDate = (date) => date.toISOString().split("T")[0];

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [range, setRange] = useState({ 
    from: getFormattedDate(sevenDaysAgo), 
    to: getFormattedDate(today) 
  });
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  const fetchData = useCallback(async (isInitial = false, customRange = null) => {
    if (!isInitial) setLoading(true);
    
    // Use customRange if provided (for initial load), otherwise use state
    const activeRange = customRange || range;
    
    const params = { 
      from: activeRange.from || undefined, 
      to: activeRange.to || undefined 
    };

    try {
      const [u, r, ps, iv, ph, sl, pm, pst, tc, sm] = await Promise.all([
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
        usersData: u.data, revenueData: r.data, parkingStatus: ps.data,
        incomeByVehicle: iv.data, peakHours: ph.data, popularSlots: sl.data,
        paymentMethods: pm.data, paymentStats: pst.data, topCustomers: tc.data,
        summary: sm.data
      });
    } catch (err) { 
        console.error("Dashboard Fetch Error:", err); 
    } finally { 
        setLoading(false); 
        if (isInitial) setInitialPageLoad(false); 
    }
  }, [range]);

  // Initial load effect
  useEffect(() => { 
    fetchData(true, { 
        from: getFormattedDate(sevenDaysAgo), 
        to: getFormattedDate(today) 
    }); 
  }, []);

  const formatHour = (hour) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  console.log("Dashboard Data:", data?.incomeByVehicle);
  const downloadFullReport = async () => {
    const element = document.getElementById("dashboard-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // 1. Add Logo and Title (Centered)
    const logoWidth = 30;
    const logoHeight = 15;
    pdf.addImage(logo, "PNG", (pageWidth / 2) - (logoWidth / 2), 10, logoWidth, logoHeight);

    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80); 
    pdf.setFont("helvetica", "bold");
    pdf.text("BUSINESS ANALYTICS REPORT", pageWidth / 2, 32, { align: "center" });

    // 2. Sub-header Info (Centered)
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.setFont("helvetica", "normal");
    
    const rangeText = `Date Range: ${range.from} to ${range.to}`;
    const generatedText = `Generated on: ${new Date().toLocaleString()}`;
    
    pdf.text(rangeText, pageWidth / 2, 40, { align: "center" });
    pdf.text(generatedText, pageWidth / 2, 46, { align: "center" });

    // 3. Dashboard Image (The charts)
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;
    
    // Starting the image at Y=55 to allow space for centered header
    pdf.addImage(imgData, "PNG", margin, 55, contentWidth, imgHeight);

    // 4. Footer
    const year = new Date().getFullYear();
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(`cityparking @ ${year}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save(`Business_Report_${range.from}_to_${range.to}.pdf`);
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

      <div id="dashboard-content" className="row g-4 p-2 mt-2 bg-white">
        {/* ROW 1 */}
        <ChartCard title="User Registration Trend" md={8}>
          <AreaChart data={data?.usersData}>
            <XAxis dataKey="_id" tick={{fontSize: 10}}/>
            <YAxis label={{ value: 'New Users', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        </ChartCard>
        
        <ChartCard title="Parking Status" md={4}>
          <PieChart>
            <Pie data={data?.parkingStatus} dataKey="value" nameKey="_id" cx="50%" cy="50%" outerRadius={80}>
              {data?.parkingStatus?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="top" align="right" layout="vertical" wrapperStyle={{fontSize: '11px'}}/>
          </PieChart>
        </ChartCard>

        {/* ROW 2 */}
        <ChartCard title="Revenue Growth" md={8}>
          <LineChart data={data?.revenueData}>
            <XAxis dataKey="_id" tick={{fontSize: 10}}/>
            <YAxis tick={{fontSize: 10}} label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}/>
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Income by Vehicle" md={4}>
          <PieChart>
            <Pie data={data?.incomeByVehicle} dataKey="value" nameKey="_id" innerRadius={50} outerRadius={80}>
              {data?.incomeByVehicle?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="top" align="right" layout="vertical" wrapperStyle={{fontSize: '11px'}}/>
          </PieChart>
        </ChartCard>

        {/* ROW 3 */}
        <ChartCard title="Peak Occupancy Hours (24h)" md={6}>
          <BarChart data={data?.peakHours}>
            <XAxis dataKey="_id" tickFormatter={formatHour} tick={{fontSize: 9}} interval={1}/>
            <YAxis label={{ value: 'Cars', angle: -90, position: 'insideLeft' }}/>
            <Tooltip labelFormatter={formatHour}/>
            <Bar dataKey="count" fill="#00C49F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 text-center rounded-4 h-100 justify-content-center">
            <Clock className="mx-auto mb-2 text-primary" size={40}/>
            <h6 className="text-muted fw-bold">Avg. Parking Session</h6>
            <h2 className="fw-bold text-dark">{data?.summary?.avgDuration?.toFixed(1) || 0} Min</h2>
            <hr />
            <div className="badge bg-success-subtle text-success p-2">Live Occupancy: {data?.summary?.liveOccupancy || 0}</div>
          </div>
        </div>

        {/* ROW 4 */}
        <ChartCard title="Payment Method Popularity" md={4}>
          <PieChart>
            <Pie data={data?.paymentMethods} dataKey="value" nameKey="_id" outerRadius={80}>
              {data?.paymentMethods?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="top" align="right" layout="vertical" wrapperStyle={{fontSize: '11px'}}/>
          </PieChart>
        </ChartCard>

        <ChartCard title="Transaction Status" md={4}>
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

        <ChartCard title="Top 5 Customers" md={4}>
          <BarChart data={data?.topCustomers} margin={{ bottom: 45 }}>
            <XAxis 
                dataKey="_id" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                tick={{fontSize: 10, fontWeight: 'bold'}}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#0d6efd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, md }) {
  return (
    <div className={`col-md-${md}`}>
      <div className="card border-0 shadow-sm p-3 rounded-4" style={{ minHeight: "380px" }}>
        <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: "12px", textTransform: "uppercase" }}>{title}</h6>
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}