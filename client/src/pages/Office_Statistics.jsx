import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import "./Office_Statistics.css";

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Office_Statistics = () => {
    const [officeData, setOfficeData] = useState([]);
    const [filterLocation, setFilterLocation] = useState('North');
    const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
    const [barChartData, setBarChartData] = useState({});
    const [pieChartData, setPieChartData] = useState({});

    useEffect(() => {
        fetchOfficeStatistics();
    }, [filterLocation, filterDateRange]);

    const fetchOfficeStatistics = async () => {
        if (!filterDateRange.start || !filterDateRange.end) {
            console.error('Start date and end date must be provided.');
            return;
        }

        try {
            const res = await axios.get(`https://group8backend.azurewebsites.net/office_statistics`, {
                params: {
                    location: filterLocation,
                    startDate: filterDateRange.start,
                    endDate: filterDateRange.end,
                },
            });

            console.log('Fetched Office Statistics:', res.data);

            setOfficeData(res.data);
            prepareBarChartData(res.data);
            preparePieChartData(res.data);
        } catch (error) {
            console.error('Error fetching office statistics:', error);
        }
    };

    const colors = [
        'rgba(75, 192, 192, 0.6)', // teal
        'rgba(255, 99, 132, 0.6)', // red
        'rgba(255, 206, 86, 0.6)', // yellow
        'rgba(54, 162, 235, 0.6)', // blue
        'rgba(153, 102, 255, 0.6)', // purple
        'rgba(255, 159, 64, 0.6)', // orange
        'rgba(255, 99, 71, 0.6)',  // tomato
        'rgba(0, 255, 255, 0.6)',  // cyan
        'rgba(144, 238, 144, 0.6)',// lightgreen
    ];

    const prepareBarChartData = (data) => {
        const labels = data.map((item) => `${item.appointment_type}`); // Updated label with appointment count
        const profits = data.map((item) => item.totalProfit);

        setBarChartData({
            labels,
            datasets: [
                {
                    label: 'Total Profits',
                    data: profits,
                    backgroundColor: colors.slice(0, data.length), // Dynamically assign colors based on the number of items
                    borderColor: colors.slice(0, data.length).map(color => color.replace('0.6', '1')), // Same color, but more opaque for border
                    borderWidth: 2,
                },
            ],
        });
    };

    const preparePieChartData = (data) => {
        const labels = data.map((item) => `${item.appointment_type} (${item.appointmentCount} appointments)`); // Updated label with appointment count
        const profits = data.map((item) => item.totalProfit);

        setPieChartData({
            labels,
            datasets: [
                {
                    label: 'Profit Distribution',
                    data: profits,
                    backgroundColor: colors.slice(0, data.length), // Dynamically assign colors based on the number of items
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                },
            ],
        });
    };

    return (
        <div className="os_page-container">
            <div className="os_dashboard">
                {/* Wrapped Office Statistics header in a container */}
                <div className="os_header-container">
                    <div className="os_header-text">Office Statistics</div>
                </div>

                {/* Filter Section */}
                <div className="os_filter-card">
                    <div className="os_filter">
                        <label className="os_label">
                            <h3 className="os_h3">Location</h3>
                            <select className="os_select" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                                <option value="North">North</option>
                                <option value="South">South</option>
                                <option value="East">East</option>
                                <option value="West">West</option>
                            </select>
                        </label>
                        <label className="os_label">
                            <h3 className="os_h3">Start Date</h3>
                            <input className="os_input-date" type="date" onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })} />
                        </label>
                        <label className="os_label">
                            <h3 className="os_h3">End Date</h3>
                            <input className="os_input-date" type="date" onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })} />
                        </label>
                        <button className="add" onClick={fetchOfficeStatistics}>Filter</button>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="os_charts">
                    <div className="os_chart-container">
                        {barChartData.labels && barChartData.labels.length > 0 ? (
                            <Bar data={barChartData} options={{ responsive: true }} />
                        ) : (
                            <p>No data available for the selected filters.</p>
                        )}
                    </div>
                    <div className="os_chart-container">
                        {pieChartData.labels && pieChartData.labels.length > 0 ? (
                            <Pie data={pieChartData} options={{ responsive: true }} />
                        ) : (
                            <p>No data available for the selected filters.</p>
                        )}
                    </div>
                </div>

                {/* Aggregate Information Section */}
                <div className="os_container">
                    <h3 className="os_h3">Aggregate Information</h3>
                    <div className="os_card-container">
                        {officeData.map((item) => (
                            <div className="os_card" key={item.appointment_type + item.totalProfit}>
                                <h4>{item.appointment_type}</h4>
                                <p>Profit: {"$" + item.totalProfit}</p>
                                <p>Appointments: {item.appointmentCount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Office_Statistics;
