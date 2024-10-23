import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [testSummary, setTestSummary] = useState({});

    useEffect(() => {
        const fetchTestSummary = async () => {
            const res = await fetch('/api/test-summary'); // 请求测试汇总数据
            const data = await res.json();
            setTestSummary(data);
        };

        fetchTestSummary(); // 初次加载时获取数据
    }, []);

    return (
        <div>
            <h2>Dashboard - Test Summary</h2>
            <pre>{JSON.stringify(testSummary, null, 2)}</pre>
        </div>
    );
};

export default Dashboard;