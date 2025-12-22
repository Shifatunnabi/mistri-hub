# Job Application Workflow - Complete Guide

## Overview
This document explains the complete workflow from when a helper applies for a job until the job is completed and confirmed.

---

## Prerequisites

### For Help Seekers (Job Posters)
1. ✅ Register as Help Seeker
2. ✅ Auto-approved upon registration
3. ✅ Receive welcome notification
4. ✅ Can post jobs immediately

### For Helpers (Service Providers)
1. ✅ Register as Helper
2. ✅ Wait for admin approval (account activation)
3. ✅ Submit verification documents (NID, certificates, etc.)
4. ✅ Wait for admin verification
5. ✅ Receive verification notification
6. ✅ Can now apply for jobs

---

## Complete Job Lifecycle

### Phase 1: Job Creation & Application
**Status: `open`**

#### Help Seeker Actions:
1. **Create Job Post**
   - Fill in job details (title, description, category, budget, location)
   - Upload photos (optional, max 5)
   - Submit job
   - Job is created with status: `open`
   - AI analysis is automatically generated

2. **View Applications**
   - Navigate to Profile → Posted Jobs tab
   - See all applicants for each job
   - View helper profiles, ratings, and reviews
   - Receive notifications when helpers apply

#### Helper Actions:
1. **Browse Jobs**
   - View job board
   - See all open jobs
   - Filter by category/location
   - View job details, photos, AI analysis

2. **Apply for Job**
   - Click "Apply for This Job" button on job details page
   - **System Checks:**
     - ✅ User is logged in
     - ✅ User role is "HELPER"
     - ✅ Helper is verified (`isVerified = true`)
     - ✅ Job status is "open"
     - ✅ Helper hasn't already applied
     - ❌ **NO SKILL/SERVICE TYPE MATCHING** - Any verified helper can apply to any job
   
   - **What Happens:**
     - Application created with status: `pending`
     - Job's `applicationCount` incremented by 1
     - Notification sent to job owner
     - Helper sees "Application Status: Pending"

3. **View Application Status**
   - Go back to job details page
   - See status: Pending / Accepted / Rejected
   - If accepted, can view timeline

#### System Updates:
- **Job Model:**
  - `applicationCount` increases
  - `status` remains `open`

- **Application Model:**
  - New record created:
    ```javascript
    {
      job: jobId,
      helper: helperId,
      status: "pending"
    }
    ```

- **Notification Created:**
  - **To:** Job owner (Help Seeker)
  - **Type:** `new_application`
  - **Title:** "New Application Received"
  - **Message:** "[Helper Name] applied for your job: [Job Title]"
  - **Link:** `/profile?tab=posted-jobs`

---

### Phase 2: Helper Selection
**Status: `open` → `assigned`**

#### Help Seeker Actions:
1. **Review Applications**
   - Go to Profile → Posted Jobs
   - Click on a job to view applicants
   - See helper details:
     - Name, rating, reviews
     - Verification badge
     - Skills, experience
     - Hourly rate
   - Click "Select Helper" on chosen applicant

2. **What Happens:**
   - Selected helper's application status: `accepted`
   - All other applications status: `rejected`
   - Job status changes to: `assigned`
   - Job's `assignedHelper` set to selected helper ID
   - Notifications sent to all applicants

#### System Updates:
- **Job Model:**
  ```javascript
  {
    status: "assigned",
    assignedHelper: selectedHelperId
  }
  ```

- **Application Model:**
  - Selected application: `status: "accepted"`
  - Other applications: `status: "rejected"`

- **Notifications Created:**
  
  **To Accepted Helper:**
  - **Type:** `application_accepted`
  - **Title:** "Application Accepted! 🎉"
  - **Message:** "Congratulations! You've been selected for the job: [Job Title]"
  - **Link:** `/jobs/[jobId]/timeline`
  - **Action Button:** "View Timeline"
  
  **To Rejected Helpers:**
  - **Type:** `application_rejected`
  - **Title:** "Application Update"
  - **Message:** "The job '[Job Title]' has been filled. Keep applying to other opportunities!"

---

### Phase 3: Schedule Job
**Status: `assigned` → `scheduled`**

#### Helper Actions:
1. **Access Timeline**
   - Click notification "View Timeline" button OR
   - Go to job details → "View Timeline"
   
2. **Schedule the Job**
   - Select date and time
   - Click "Schedule Job"
   - Enter scheduled date

#### System Updates:
- **Job Model:**
  ```javascript
  {
    status: "scheduled",
    scheduledDate: selectedDateTime
  }
  ```

- **Notification Created:**
  - **To:** Help Seeker
  - **Type:** `timeline_update`
  - **Title:** "Job Scheduled"
  - **Message:** "Your job '[Job Title]' has been scheduled for [Date]."
  - **Link:** `/jobs/[jobId]/timeline`

---

### Phase 4: Start Work
**Status: `scheduled` → `in_progress`**

#### Helper Actions:
1. **Start Job**
   - On scheduled date (or when ready)
   - Go to timeline
   - Click "Start Job" button

#### System Updates:
- **Job Model:**
  ```javascript
  {
    status: "in_progress",
    startedAt: currentTimestamp
  }
  ```

- **Notification Created:**
  - **To:** Help Seeker
  - **Type:** `timeline_update`
  - **Title:** "Job Started"
  - **Message:** "Work has started on your job: [Job Title]"
  - **Link:** `/jobs/[jobId]/timeline`

---

### Phase 5: Complete Work
**Status: `in_progress` → `pending_review`**

#### Helper Actions:
1. **Mark as Complete**
   - When work is finished
   - Go to timeline
   - Click "Mark as Complete"

#### System Updates:
- **Job Model:**
  ```javascript
  {
    status: "pending_review",
    completedAt: currentTimestamp
  }
  ```

- **Notification Created:**
  - **To:** Help Seeker
  - **Type:** `timeline_update`
  - **Title:** "Job Completed - Awaiting Confirmation"
  - **Message:** "The helper has marked your job '[Job Title]' as complete. Please review and confirm."
  - **Link:** `/jobs/[jobId]/timeline`

---

### Phase 6: Confirmation & Review
**Status: `pending_review` → `completed`**

#### Help Seeker Actions:
1. **Review Work**
   - Receive notification
   - Go to timeline
   - Inspect completed work

2. **Confirm Completion**
   - Click "Confirm Completion" button
   - Optionally leave a review (star rating + comment)

#### System Updates:
- **Job Model:**
  ```javascript
  {
    status: "completed",
    confirmedAt: currentTimestamp
  }
  ```

- **Helper's Profile Updated:**
  ```javascript
  {
    "helperProfile.completedJobs": +1,
    // If review left:
    "helperProfile.rating": recalculated,
    "helperProfile.totalReviews": +1
  }
  ```

- **Review Created (if provided):**
  ```javascript
  {
    helper: helperId,
    job: jobId,
    reviewer: seekerId,
    rating: 1-5,
    comment: "Review text"
  }
  ```

- **Notification Created:**
  - **To:** Helper
  - **Type:** `timeline_update`
  - **Title:** "Job Confirmed - Well Done! 🎉"
  - **Message:** "The job '[Job Title]' has been confirmed as completed. Great work!"
  - **Link:** `/jobs/[jobId]/timeline`

---

## Job Status Flow Chart

```
open → assigned → scheduled → in_progress → pending_review → completed
  ↑        ↑          ↑            ↑              ↑             ↑
Seeker  Seeker     Helper       Helper        Seeker       Seeker
posts    selects   schedules    starts       confirms     (final)
job      helper      work        work          work
```

---

## Profile Changes Throughout Lifecycle

### Help Seeker Profile

#### Before Job:
- Can create unlimited jobs
- View posted jobs in profile

#### During Job:
- Posted Jobs tab shows:
  - Job status
  - Application count
  - View applications button
  - Timeline access

#### After Job:
- Job appears in completed jobs
- Can leave review for helper
- Job remains in history

### Helper Profile

#### Before Application:
```javascript
{
  isApproved: true,
  isVerified: true,
  helperProfile: {
    completedJobs: X,
    rating: Y,
    totalReviews: Z
  }
}
```

#### During Application (Pending):
- Can view application status on job page
- Cannot apply again to same job
- Can apply to other jobs

#### After Selection (Accepted):
- Can access job timeline
- Can schedule/start/complete job
- Responsible for job progression

#### After Job Completion:
```javascript
{
  helperProfile: {
    completedJobs: X + 1,  // Incremented
    rating: recalculated,  // If review received
    totalReviews: Z + 1    // If review received
  }
}
```

---

## Notification Summary

### Notification Types:
1. **`welcome`** - First time registration
2. **`new_application`** - Helper applies (→ Seeker)
3. **`application_accepted`** - Helper selected (→ Helper)
4. **`application_rejected`** - Not selected (→ Helper)
5. **`timeline_update`** - Job status changes (→ Both)
6. **`verification_update`** - Verification approved/rejected (→ Helper)
7. **`new_review`** - Review received (→ Helper)

### Notification Features:
- Real-time unread count badge
- Auto-refresh every 30 seconds
- Auto-mark as read when opened
- Click to navigate to relevant page
- "View Timeline" button for accepted applications
- Timestamped (relative time)

---

## API Endpoints Used

### Application Flow:
- `POST /api/jobs` - Create job
- `POST /api/jobs/[id]/apply` - Apply for job
- `GET /api/jobs/[id]/applications` - View applications
- `POST /api/jobs/[id]/applications/[applicationId]/accept` - Select helper

### Timeline Flow:
- `POST /api/jobs/[id]/schedule` - Schedule job
- `POST /api/jobs/[id]/start` - Start job
- `POST /api/jobs/[id]/complete` - Mark complete
- `POST /api/jobs/[id]/confirm` - Confirm completion

### Notification Flow:
- `GET /api/notifications` - Fetch notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/mark-read` - Mark all as read

---

## Important Notes

### ✅ **NO SKILL MATCHING**
- Any verified helper can apply to any job
- No restrictions based on helper's service categories
- No skill/service type validation during application

### ✅ **Verification Required**
- Helpers MUST be verified (`isVerified = true`) to apply
- Error shown: "Please verify yourself first to apply for jobs"
- Verification done by admin from admin panel

### ✅ **Single Helper Selection**
- Only one helper can be selected per job
- Once selected, all other applications auto-rejected
- Job status changes to `assigned`

### ✅ **Application Count**
- Displayed on completed/assigned jobs
- Shows total number of applications received
- Visible to both seekers and helpers

---

## Common User Flows

### Help Seeker Journey:
1. Register → Auto-approved → Welcome notification
2. Create job post → Receive applications
3. View applicants → Select helper → Helper assigned notification
4. Receive schedule notification → Receive start notification
5. Receive completion notification → Confirm work → Leave review
6. Job completed 🎉

### Helper Journey:
1. Register → Wait for admin approval
2. Submit verification docs → Wait for verification → Verification notification
3. Browse jobs → Apply → Wait for selection
4. Receive acceptance notification → View timeline
5. Schedule job → Start job → Complete job
6. Receive confirmation notification → Job completed 🎉

---

## Database Models Impact

### During Job Lifecycle:
- **Job:** Status, assignedHelper, scheduledDate, startedAt, completedAt, confirmedAt
- **Application:** Status (pending → accepted/rejected)
- **User (Helper):** completedJobs count, rating, totalReviews
- **Notification:** Multiple notifications created
- **Review:** Created on confirmation (optional)

---

This is the complete workflow! Every step is automated with proper notifications and status updates.
