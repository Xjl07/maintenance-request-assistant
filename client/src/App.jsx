import companyLogo from './assets/company-logo.png'
import { useEffect, useState } from 'react'
import { translations } from './translations'
import './App.css'
const categories = [
  'سباكة',
  'كهرباء',
  'نجارة',
  'تكييف',
  'عزل',
  'أرضيات',
  'أخرى',
]

const priorities = ['عادي', 'عاجل']
function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('fixly-language') === 'en' ? 'en' : 'ar'
    } catch {
      return 'ar'
    }
  })

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fixly-theme') === 'dark'
        ? 'dark'
        : 'light'
    } catch {
      return 'light'
    }
  })
  const t = translations[language]
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [savedRequests, setSavedRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      localStorage.setItem('fixly-theme', theme)
    } catch {
      // يستمر التبديل حتى لو تعذر حفظ الاختيار.
    }
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'

    try {
      localStorage.setItem('fixly-language', language)
    } catch {
      // يظل تبديل اللغة يعمل حتى لو تعذر حفظ التفضيل.
    }
  }, [language])

  useEffect(() => {
    const controller = new AbortController()

    async function loadRequests() {
      try {
        const response = await fetch('/api/requests', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('تعذر تحميل الطلبات المحفوظة.')
        }

        const data = await response.json()
        setSavedRequests(data.requests)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRequestsError('loadFailed')
        }
      } finally {
        if (!controller.signal.aborted) {
          setRequestsLoading(false)
        }
      }
    }

    loadRequests()

    return () => controller.abort()
  }, [])

  function updateSuggestion(index, field, value) {
    setSuggestions((currentSuggestions) =>
      currentSuggestions.map((request, currentIndex) =>
        currentIndex === index
          ? { ...request, [field]: value }
          : request
      )
    )
  }
  async function handleSave() {
    if (isSaving || isSubmitting || suggestions.length === 0) return

    setIsSaving(true)
    setSaveError('')
    setSaveMessage('')

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: suggestions }),
      })

      if (!response.ok) {
        throw new Error(
          response.status === 400 ? 'invalidRequests' : 'saveFailed'
        )
      }

      const data = await response.json()

      setSavedRequests((currentRequests) => [
        ...data.requests,
        ...currentRequests,
      ])
      setSuggestions([])
      setSaveMessage('')
      setSaveError('')
      setDescription('')
      setMessage('')
      setSaveMessage('saveSuccess')
    } catch (error) {
      setSaveError(
        error instanceof TypeError
          ? 'connectionFailed'
          : error.message
      )
    } finally {
      setIsSaving(false)
    }
  }
  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || isSaving) return

    setError('')
    setMessage('')
    setSuggestions([])
    setSaveMessage('')
    setSaveError('')


    if (!description.trim()) {
      setError('descriptionRequired')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const messageKey =
          response.status === 429
            ? 'rateLimited'
            : response.status === 400
              ? 'invalidDescription'
              : 'analysisFailed'

        throw new Error(messageKey)
      }

      const data = await response.json()
      setSuggestions(data.requests)
      setMessage(data.requests.length ? 'analysisSuccess' : 'noProblems')
    } catch (error) {
      setError(
        error instanceof TypeError
          ? 'connectionFailed'
          : error.message
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header>
        <div className="header-bar">
          <div className="company-brand">
            <img
              src={companyLogo}
              alt={
                language === 'ar'
                  ? 'أبعاد الهندسة للمقاولات'
                  : 'Engineering Dimensions'
              }
              className="company-logo"
              width="552"
              height="203"
            />
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="language-button"
              onClick={() =>
                setLanguage((current) => (current === 'ar' ? 'en' : 'ar'))
              }
              aria-label={
                language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'
              }
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
            <button
              type="button"
              className="language-button theme-button"
              onClick={() =>
                setTheme((current) => (current === 'light' ? 'dark' : 'light'))
              }
              aria-label={
                theme === 'light'
                  ? language === 'ar'
                    ? 'تفعيل الوضع الداكن'
                    : 'Switch to dark mode'
                  : language === 'ar'
                    ? 'تفعيل الوضع الفاتح'
                    : 'Switch to light mode'
              }
            >

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {theme === 'light' ? (
                  <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                  </>
                )}
              </svg>

            </button>

          </div>
        </div>

        <h1>
          {language === 'ar'
            ? 'وش المشكلة اللي تحتاج فني؟'
            : 'What needs fixing?'}
        </h1>

        <p>
          {language === 'ar'
            ? 'اكتب التفاصيل، وبنساعدك تحدد التخصص والأولوية.'
            : 'Describe the problem, and we’ll suggest a specialty and priority.'}
        </p>
      </header>

      <form
        className="request-card"
        aria-labelledby="request-title"
        onSubmit={handleSubmit}
      >
        <h2 id="request-title">{t.requestTitle}</h2>

        <label htmlFor="description">{t.descriptionLabel}</label>

        <textarea
          id="description"
          value={description}
          disabled={isSubmitting || isSaving}
          onChange={(event) => {
            setDescription(event.target.value)
            setError('')
            setMessage('')
            setSuggestions([])
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'description-error' : undefined}
          placeholder={t.placeholder}
          rows={6}
          maxLength={2000}
          dir={description.trim() ? 'auto' : language === 'ar' ? 'rtl' : 'ltr'}
        />

        <p className="character-count">
          <bdi>{description.length} / 2000</bdi> {t.characters}
        </p>

        <div className="preview">
          <h3>{t.previewTitle}</h3>
          <p dir="auto">
            {description.trim() || t.previewEmpty}
          </p>
        </div>

        {error && (
          <p id="description-error" className="error-message" role="alert">
            {t[error] ?? error}
          </p>
        )}

        <p className="development-note" role="status">
          {t[message] ?? message}
        </p>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isSaving}
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
      {suggestions.length > 0 && (
        <section className="request-card" aria-labelledby="suggestions-title">
          <h2 id="suggestions-title">{t.suggestionsTitle}</h2>
          <p>{t.reviewNote}</p>

          {suggestions.map((request, index) => (
            <article className="preview" key={index}>
              <h3>{t.problem} {index + 1}</h3>
              <p dir="auto">{request.description}</p>
              <div className="suggestion-fields">
                <div>
                  <label htmlFor={`category-${index}`}>{t.categoryLabel}</label>
                  <select
                    disabled={isSaving}
                    id={`category-${index}`}
                    value={request.category}
                    onChange={(event) =>
                      updateSuggestion(index, 'category', event.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {t.categoryNames[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`priority-${index}`}>{t.priorityLabel}</label>
                  <select
                    disabled={isSaving}
                    id={`priority-${index}`}
                    value={request.priority}
                    onChange={(event) =>
                      updateSuggestion(index, 'priority', event.target.value)
                    }
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {t.priorityNames[priority]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
          <button
            type="button"
            className="submit-button"
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
          >
            {isSaving ? t.saving : t.save}
          </button>
        </section>
      )}
      {saveError && (
        <p className="error-message" role="alert">
          {t[saveError] ?? saveError}
        </p>
      )}

      <p role="status">{t[saveMessage] ?? saveMessage}</p>

      <section className="request-card" aria-labelledby="saved-title">
        <h2 id="saved-title">{t.savedTitle}</h2>

        {requestsLoading && (
          <p role="status">{t.loadingRequests}</p>
        )}

        {requestsError && (
          <p className="error-message" role="alert">
            {t[requestsError] ?? requestsError}
          </p>
        )}

        {!requestsLoading &&
          !requestsError &&
          savedRequests.length === 0 && (
            <p>{t.emptyRequests}</p>
          )}

        {savedRequests.map((request) => (
          <article className="preview" key={request.id}>
            <h3 dir="auto">{request.description}</h3>

            <p>
              <strong>{t.categoryLabel}:</strong>{' '}
              {t.categoryNames[request.category] ?? request.category}
            </p>

            <p>
              <strong>{t.priorityLabel}:</strong>{' '}
              {t.priorityNames[request.priority] ?? request.priority}
            </p>

            <p>
              <strong>{t.requestDate}:</strong>{' '}
              <time dateTime={request.createdAt}>
                {new Date(request.createdAt).toLocaleString(
                  language === 'ar' ? 'ar-SA' : 'en-GB',
                  {
                    calendar: 'gregory',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }
                )}
              </time>
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App