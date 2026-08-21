# EZFINANZ – Loan Management Platform

EZFINANZ is a web-based loan management platform that allows customers to create accounts, complete KYC verification, apply for loans, and track their loan applications. Administrators can review and manage customer loan applications through an admin dashboard.

## Live Application

https://ezfinanaz-frontend5.onrender.com

## Features

### Customer

- Customer registration and login
- Email and password authentication
- Customer KYC verification
- Loan application
- Loan application tracking
- Customer dashboard
- Secure logout
- Role-based access

### Authentication

The system is designed to support multiple authentication methods:

- Email and Password
- Email verification
- Phone number verification using OTP
- Google OAuth login

### Loan Management

Customers can:

- Apply for a loan
- Enter loan details
- Select EMI and tenure
- Provide bank account information
- Complete required declarations
- Submit required verification information
- Track the current application stage

### Admin

Administrators can:

- Access the Admin Dashboard
- View all loan applications
- View applicant details
- View requested loan amount
- View loan tenure
- View current application stage
- View submission date
- Open individual loan applications
- Refresh application data

## Application Flow

### Customer Flow

```text
Sign Up / Login
       ↓
Email & Phone Verification
       ↓
KYC Verification
       ↓
Customer Dashboard
       ↓
Apply for Loan
       ↓
Loan Details
       ↓
EMI Selection
       ↓
Bank Account
       ↓
Declaration
       ↓
Selfie / Verification
       ↓
Admin Review
       ↓
Loan Decision
       ↓
Disbursement
```
