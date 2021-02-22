# tenderd-rfsc

## Database (Firestore)

### Document structure
```
Company
{
  name: string
}

User
{
  company: (reference)
  displayName: string
  email: string
}

Request
{
company: string // Company Name
created: number //timestamp
description: string
id: string // userId + timestamp
status: string // ○ Created ○ In progress ○ Completed ○ Cancelled
type: string // Breakdown ○ Maintenance ○ Replacement ○ Demobilisation
user: string
}
```

- TypeScript on NodeJS backend 100% serverless via Cloud functions
- TypeScript on ReactJS with Material Design for UI

## Things not done
- REST APIs (platform with authentication already implemented)
- Change history for requests
- Edit existing images/documents for requests
- Good looking UI
