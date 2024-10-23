const cors = require('cors');
const express = require('express');
const fs = require('fs').promises;
const EventEmitter = require('node:events');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = 3000;
const DB_PATH = path.join(__dirname, '../DB', 'db.json');
const clientEvents = new EventEmitter();
clientEvents.setMaxListeners(50);

const app = express();
app.use(bodyParser.json());
app.use(cors())

app.get('/api/client-status-stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let lastSnapshot = []; // 存储上一次的客户端状态

    // 状态更新时推送数据
    const sendClientUpdate = async () => {
        const clients = await readDB();
        res.write(`data: ${JSON.stringify(clients)}\n\n`);
    };

    // 监听事件触发
    clientEvents.on('clientStatusChanged', sendClientUpdate);

    // 客户端断开时清除监听
    req.on('close', () => {
        clientEvents.removeListener('clientStatusChanged', sendClientUpdate);
    });
});

/**
 * 读取数据库文件内容
 */
const readDB = async () => {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
};

/**
 * 写入数据库文件
 */
const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * API 1: 获取所有客户端
 */
app.get('/api/clients', async (req, res) => {
    try {
        console.log('trigger get clients')
        const clients = await readDB();
        res.json(clients);
    } catch (error) {
        res.send(error)
        console.dir(error)
        res.status(500).send('Error reading database');
    }
});

/**
 * API 2: 启动 Client
 */
app.post('/api/client/start', async (req, res) => {
    const { id, usedBy, params } = req.body; // 接收启动的参数
    try {
        const clients = await readDB();
        const client = clients.find((c) => c.id === id);

        if (!client || client.status !== 'idle') {
            return res.status(400).json({ message: 'Client is not available' });
        }

        // 更新 client 状态为 running
        client.status = 'running';
        client.runningTime = 0; // 重置运行时间
        client.usedBy = usedBy;
        await writeDB(clients);

        // 模拟通知客户端启动
        console.log(`Client ${id} started with params:`, params);
        clientEvents.emit('clientStatusChanged');

        res.json({ message: 'Client started', client });
    } catch (error) {
        res.status(500).send('Error starting client');
    }
});

/**
 * API 3: 更新 Client 状态 (停止或还原)
 */
app.post('/api/client/update', async (req, res) => {
    const { id, status, usedBy } = req.body; // 接收新的状态
    try {
        const clients = await readDB();
        const client = clients.find((c) => c.id === id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // 更新状态
        client.status = status;
        client.runningTime = status === 'idle' ? 0 : client.runningTime;
        client.usedBy = usedBy

        await writeDB(clients);
        console.log(`Client ${id} updated to status: ${status}`);
        console.log(`Client ${id} updated to usedBy: ${usedBy}`);
        clientEvents.emit('clientStatusChanged');

        res.json({ message: 'Client updated', client });
    } catch (error) {
        res.status(500).send('Error updating client');
    }
});

/**
 * API 4: 客户端完成任务后通知服务端
 */
app.post('/api/client/done', async (req, res) => {
    const { id } = req.body;
    try {
        const clients = await readDB();
        const client = clients.find((c) => c.id === id);

        if (!client || client.status !== 'running') {
            return res.status(400).json({ message: 'Client is not running' });
        }

        // 更新状态为 done
        client.status = 'done';
        await writeDB(clients);

        console.log(`Client ${id} marked as done`);

        clientEvents.emit('clientStatusChanged');

        res.json({ message: 'Client job completed', client });
    } catch (error) {
        res.status(500).send('Error marking client as done');
    }
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});