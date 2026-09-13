import { analyzeProblem } from './analyze-problem.mjs'

try {
    const requests = await analyzeProblem(
        'حنفية الحمام تنقط ببطء من أمس، وفي غرفة النوم المقبس يطلع شرر الآن.'
    )

    console.log(JSON.stringify(requests, null, 2))
} catch (error) {
    console.error('فشل اختبار التحليل.')
    console.error('رمز الخطأ:', error.status ?? error.code ?? 'غير متوفر')
    const apiKey = process.env.GEMINI_API_KEY

    const safeMessage = String(error.message ?? '')
        .split(apiKey || '__NO_KEY__')
        .join('[REDACTED]')
        .replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]')

    console.error('التفاصيل:', safeMessage)
}