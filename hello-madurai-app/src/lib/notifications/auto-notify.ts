import { sendContentNotification } from '@/lib/firebase/fcm'
import { createClient } from '@/lib/supabase/server'

// Auto-send notification when news is published
export async function notifyNewNews(newsId: string) {
  try {
    const supabase = await createClient()
    
    const { data: news, error } = await supabase
      .from('news')
      .select('title, title_ta, excerpt, excerpt_ta, category')
      .eq('id', newsId)
      .eq('status', 'published')
      .single()

    if (error || !news) {
      console.error('Error fetching news for notification:', error)
      return false
    }

    const link = `/news/${newsId}`
    
    return await sendContentNotification(
      'news',
      `📰 ${news.title}`,
      news.excerpt || 'New article published',
      news.title_ta ? `📰 ${news.title_ta}` : undefined,
      news.excerpt_ta || 'புதிய கட்டுரை வெளியிடப்பட்டுள்ளது',
      link
    )
  } catch (error) {
    console.error('Error sending news notification:', error)
    return false
  }
}

// Auto-send notification when event is published
export async function notifyNewEvent(eventId: string) {
  try {
    const supabase = await createClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .select('title, title_ta, description, description_ta, event_date, location')
      .eq('id', eventId)
      .eq('status', 'published')
      .single()

    if (error || !event) {
      console.error('Error fetching event for notification:', error)
      return false
    }

    const eventDate = new Date(event.event_date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })

    const link = `/events/${eventId}`
    
    return await sendContentNotification(
      'event',
      `🎉 ${event.title}`,
      `${eventDate} - ${event.location || 'Madurai'}`,
      event.title_ta ? `🎉 ${event.title_ta}` : undefined,
      `${eventDate} - ${event.location || 'மதுரை'}`,
      link
    )
  } catch (error) {
    console.error('Error sending event notification:', error)
    return false
  }
}

// Auto-send notification when job is published
export async function notifyNewJob(jobId: string) {
  try {
    const supabase = await createClient()
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('title, title_ta, company_name, company_name_ta, location, location_ta')
      .eq('id', jobId)
      .eq('status', 'published')
      .single()

    if (error || !job) {
      console.error('Error fetching job for notification:', error)
      return false
    }

    const link = `/jobs/${jobId}`
    
    return await sendContentNotification(
      'job',
      `💼 ${job.title}`,
      `${job.company_name} - ${job.location}`,
      job.title_ta ? `💼 ${job.title_ta}` : undefined,
      `${job.company_name_ta || job.company_name} - ${job.location_ta || job.location}`,
      link
    )
  } catch (error) {
    console.error('Error sending job notification:', error)
    return false
  }
}

// Send emergency notification
export async function sendEmergencyNotification(
  title: string,
  message: string,
  title_ta?: string,
  message_ta?: string,
  link?: string
) {
  try {
    return await sendContentNotification(
      'emergency',
      `🚨 ${title}`,
      message,
      title_ta ? `🚨 ${title_ta}` : undefined,
      message_ta,
      link
    )
  } catch (error) {
    console.error('Error sending emergency notification:', error)
    return false
  }
}

// Send weather alert
export async function sendWeatherAlert(
  condition: string,
  condition_ta?: string,
  description?: string,
  description_ta?: string
) {
  try {
    const link = '/weather'
    
    return await sendContentNotification(
      'emergency',
      `🌦️ Weather Alert`,
      `${condition}${description ? ` - ${description}` : ''}`,
      `🌦️ வானிலை எச்சரிக்கை`,
      `${condition_ta || condition}${description_ta ? ` - ${description_ta}` : ''}`,
      link
    )
  } catch (error) {
    console.error('Error sending weather alert:', error)
    return false
  }
}

// Database trigger functions (to be called from Supabase functions)
export async function handleContentPublished(
  table: string,
  record: any,
  old_record?: any
) {
  // Only send notification if status changed to 'published'
  if (record.status === 'published' && old_record?.status !== 'published') {
    switch (table) {
      case 'news':
        await notifyNewNews(record.id)
        break
      case 'events':
        await notifyNewEvent(record.id)
        break
      case 'jobs':
        await notifyNewJob(record.id)
        break
      default:
        console.log(`No notification handler for table: ${table}`)
    }
  }
}

// Scheduled notification for upcoming events (to be called by cron job)
export async function sendEventReminders() {
  try {
    const supabase = await createClient()
    
    // Get events happening tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, title_ta, event_date, location, location_ta')
      .eq('status', 'published')
      .gte('event_date', tomorrow.toISOString())
      .lt('event_date', dayAfter.toISOString())

    if (error) {
      console.error('Error fetching events for reminders:', error)
      return false
    }

    if (!events || events.length === 0) {
      console.log('No events tomorrow to remind about')
      return true
    }

    // Send reminder for each event
    const results = await Promise.all(
      events.map(async (event) => {
        const link = `/events/${event.id}`
        
        return await sendContentNotification(
          'event',
          `⏰ Event Reminder: ${event.title}`,
          `Tomorrow at ${event.location || 'Madurai'}`,
          event.title_ta ? `⏰ நிகழ்வு நினைவூட்டல்: ${event.title_ta}` : undefined,
          `நாளை ${event.location_ta || event.location || 'மதுரையில்'}`,
          link
        )
      })
    )

    return results.every(result => result)
  } catch (error) {
    console.error('Error sending event reminders:', error)
    return false
  }
}

// Log notification in database
export async function logNotification(
  title: string,
  body: string,
  targetType: string,
  targetValue?: string,
  contentType?: string,
  contentId?: string,
  sentBy?: string
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        title,
        body,
        target_type: targetType,
        target_value: targetValue,
        content_type: contentType,
        content_id: contentId,
        sent_by: sentBy,
        success_count: 1, // This would be updated based on actual FCM response
        failure_count: 0,
      })

    if (error) {
      console.error('Error logging notification:', error)
    }
  } catch (error) {
    console.error('Error logging notification:', error)
  }
}
