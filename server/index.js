const express = require('express')

const app = express()
const PORT = 3001
const { randomUUID } = require('node:crypto')

const savedRequests = []

const allowedCategories = [
    'سباكة',
    'كهرباء',
    'نجارة',
    'تكييف',
    'عزل',
    'أرضيات',
    'أخرى',
]

const allowedPriorities = ['عادي', 'عاجل']

app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Fixly server is running',
    })
})

app.post('/api/analyze', async (req, res) => {
    const description = req.body?.description

    if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
            error: 'اكتب وصف المشكلة قبل الإرسال.',
        })
    }

    if (description.length > 2000) {
        return res.status(400).json({
            error: 'الوصف يجب ألا يتجاوز 2000 حرف.',
        })
    }

    try {
        const { analyzeProblem } = await import('./analyze-problem.mjs')
        const requests = await analyzeProblem(description.trim())

        res.json({
            requests,
            message: requests.length
                ? `تم تحليل الوصف واقتراح ${requests.length} طلب.`
                : 'لم نجد مشكلة صيانة واضحة. أضف تفاصيل أكثر.',
        })
    } catch (error) {
        const status = Number(error.status ?? error.code)

        console.error('فشل التحليل. رمز الخطأ:', status || 'غير متوفر')

        if (status === 429) {
            return res.status(429).json({
                error: 'وصلنا إلى حد استخدام خدمة التحليل. حاول لاحقًا.',
            })
        }

        res.status(502).json({
            error: 'تعذر تحليل الوصف حاليًا. حاول مرة أخرى لاحقًا.',
        })
    }
})
app.get('/api/requests', (req, res) => {
    res.json({ requests: savedRequests })
})

app.post('/api/requests', (req, res) => {
    const requests = req.body?.requests

    if (
        !Array.isArray(requests) ||
        requests.length === 0 ||
        requests.length > 20
    ) {
        return res.status(400).json({
            error: 'أرسل قائمة تحتوي على طلب واحد إلى 20 طلبًا.',
        })
    }

    const valid = requests.every((request) => {
        return (
            request !== null &&
            typeof request === 'object' &&
            typeof request.description === 'string' &&
            request.description.trim().length > 0 &&
            request.description.length <= 2000 &&
            allowedCategories.includes(request.category) &&
            allowedPriorities.includes(request.priority)
        )
    })

    if (!valid) {
        return res.status(400).json({
            error: 'تحقق من وصف كل طلب وتصنيفه وأولويته.',
        })
    }

    const createdAt = new Date().toISOString()

    const newRequests = requests.map((request) => ({
        id: randomUUID(),
        description: request.description.trim(),
        category: request.category,
        priority: request.priority,
        createdAt,
    }))

    savedRequests.unshift(...newRequests)

    res.status(201).json({
        message: 'تم حفظ الطلبات بنجاح.',
        requests: newRequests,
    })
})
app.listen(PORT, '127.0.0.1', (error) => {
    if (error) {
        console.error('تعذر تشغيل الخادم:', error.code)
        process.exitCode = 1
        return
    }

    console.log(`Fixly server: http://127.0.0.1:${PORT}`)
})