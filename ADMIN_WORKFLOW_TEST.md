# Admin Dashboard Workflow Test

## Overview
This document outlines all admin functions and workflows that should be tested to ensure the admin dashboard is fully functional.

## Admin Login
1. Navigate to `/prihlaseni`
2. Login with admin credentials: `admin@prostormat.cz` / `admin123`
3. Should redirect to `/dashboard`

## Admin Dashboard Navigation Test

### Main Dashboard (`/dashboard`)
- ✅ Should display admin overview with stats
- ✅ Should show total users, venues, event requests, inquiries
- ✅ Should have sidebar navigation working

### User Management (`/dashboard/users`)
- ✅ Should display list of all users
- ✅ Should show user statistics (total, admins, venue managers, regular users)
- ✅ Should display user table with:
  - Name, email, phone
  - Role badges
  - Company information
  - Activity stats (venues, requests, inquiries)
  - Registration date
  - Detail button
- ✅ Clicking "Detail" should navigate to `/dashboard/users/{id}`

### User Detail Page (`/dashboard/users/{id}`)
- ✅ Should display detailed user information
- ✅ Should show user avatar and contact info
- ✅ Should have tabs for:
  - Venues (if venue manager)
  - Event requests
  - Venue inquiries
  - Billing information
- ✅ Should allow navigation back to users list

### Venue Management (`/dashboard/venues`)
- ✅ Should display venue management interface
- ✅ Should show data table with all venues
- ✅ Should allow filtering and searching
- ✅ Should allow editing venues
- ✅ Should show venue statistics

### Venue Detail/Edit (`/dashboard/venues/{id}`)
- ✅ Should allow editing venue details
- ✅ Should allow assigning managers
- ✅ Should show venue statistics
- ✅ Should allow status changes

### Statistics (`/dashboard/stats`)
- ✅ Should display platform-wide statistics
- ✅ Should show overview metrics:
  - Total users, venues, requests, inquiries
  - Recent activity (30 days)
- ✅ Should show distribution charts:
  - Users by role
  - Venues by type
- ✅ Should display growth metrics

### Settings (`/dashboard/settings`)
- ✅ Should display system configuration
- ✅ Should show system status information
- ✅ Should provide database management tools
- ✅ Should show email configuration options
- ✅ Should show security settings
- ✅ Should show site configuration options

## Admin Actions Workflow

### User Management Actions
1. **View All Users**
   - Navigate to `/dashboard/users`
   - Verify user list loads
   - Check statistics are accurate

2. **View User Details**
   - Click on any user "Detail" button
   - Verify user profile loads
   - Check all tabs work correctly
   - Verify data is accurate

3. **Manage User Roles**
   - From user detail page
   - Verify role is displayed correctly
   - Admin should be able to change roles (TODO: implement)

### Venue Management Actions
1. **View All Venues**
   - Navigate to `/dashboard/venues`
   - Verify venue list loads
   - Check filtering works
   - Check search functionality

2. **Edit Venue**
   - Click edit on any venue
   - Verify venue edit form loads
   - Test venue information updates
   - Test manager assignment

3. **Assign Venue Manager**
   - Go to venue edit page
   - Use email assignment feature
   - Verify manager is assigned correctly
   - Check user gets promoted to venue_manager role

### Database Management
1. **Seed Database**
   - Navigate to `/dashboard/settings`
   - Access seed endpoint
   - Verify it works with password: `prostormat-seed-2025`
   - Check that venues are created

2. **Monitor System Status**
   - Check system status indicators
   - Verify database connection status
   - Review user/venue counts

### Content Management
1. **Blog Management**
   - Navigate to blog admin (TODO: implement)
   - Create/edit blog posts
   - Publish/unpublish posts

2. **Event Request Management**
   - View all event requests
   - Manage request status
   - Contact requesters

## Error Handling Tests

### Authentication
- ✅ Non-admin users should be redirected
- ✅ Unauthenticated users should be redirected to login

### Missing Data
- ✅ Pages should handle missing data gracefully
- ✅ Database errors should be caught and displayed properly

### Navigation
- ✅ All navigation links should work
- ✅ No 404 errors on admin routes
- ✅ Back buttons should work correctly

## Performance Tests

### Page Load Times
- All admin pages should load within 3 seconds
- Database queries should be optimized
- Large data sets should be paginated

### Database Performance
- User listing should handle 1000+ users
- Venue listing should handle 100+ venues
- Statistics calculations should be efficient

## Security Tests

### Access Control
- ✅ Only admin users can access admin routes
- ✅ Venue managers can only edit their own venues
- ✅ Regular users cannot access admin functions

### Data Protection
- Sensitive user data should be protected
- Password hashes should not be exposed
- Email addresses should be handled securely

## Expected Issues and TODOs

### Known Missing Features
1. User role editing functionality
2. Venue deletion capability
3. Blog post management interface
4. Email configuration saving
5. Security settings implementation
6. Bulk user operations
7. Advanced venue statistics
8. Email notifications for admin actions

### Future Enhancements
1. Real-time notifications
2. Advanced analytics dashboard
3. Automated user verification
4. Payment management integration
5. Advanced search and filtering
6. Export functionality for data
7. Audit logging for admin actions
8. Mobile-responsive admin interface

## Test Completion Checklist

- [ ] All navigation links work without 404 errors
- [ ] User management displays correctly
- [ ] Venue management functions properly
- [ ] Statistics page shows accurate data
- [ ] Settings page loads and displays system info
- [ ] User detail pages work for all user types
- [ ] Venue assignment functionality works
- [ ] Database seeding works correctly
- [ ] Admin authentication and authorization work
- [ ] Error handling is graceful
- [ ] Mobile responsiveness is acceptable
- [ ] Performance is acceptable for expected load

## Test Results
_To be filled during testing_

Date: ___________
Tester: ___________
Environment: ___________

**Navigation Tests:** ☐ Pass ☐ Fail
**User Management:** ☐ Pass ☐ Fail  
**Venue Management:** ☐ Pass ☐ Fail
**Statistics:** ☐ Pass ☐ Fail
**Settings:** ☐ Pass ☐ Fail
**Security:** ☐ Pass ☐ Fail

**Notes:**