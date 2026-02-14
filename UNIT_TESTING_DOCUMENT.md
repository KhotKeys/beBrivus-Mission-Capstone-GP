# Unit Testing Document

## Purpose
Document unit testing coverage and performance validation, including load capacity and response-time measurement under no-user and peak-user scenarios. This section is written as a dedicated testing section for the capstone report.

## Scope
- Backend: API endpoints, business logic, and database interactions (mocked where appropriate)
- Frontend: UI logic and data-fetching hooks (mocked APIs)
- Performance: Response time and throughput for critical API routes

## Testing Strategy (Dedicated Section)
- What was tested (unit scope, boundaries, mocks)
- Why these areas were prioritized (risk and user impact)
- Tools and environments used
- How failures were handled and fixed (briefly summarize key fixes)

## Test Environment
- OS:
- CPU/RAM:
- Backend runtime:
- Database:
- Frontend runtime:
- Network conditions:

## Tools
- Unit test framework:
- Mocking tools:
- Load test tool:

## Visual Evidence (Required)
- Attach charts or graphs for response time and throughput
- Include screenshots of test logs or performance dashboards
- Link raw test output files in the Appendix

## Unit Test Coverage Summary
| Area | Status | Notes |
| --- | --- | --- |
| Backend services |  |  |
| API serializers |  |  |
| API views |  |  |
| Frontend components |  |  |
| Frontend hooks |  |  |

## Performance Testing Overview
### Goals
- Determine load capacity (max sustainable throughput before SLO breach)
- Measure response time under no-user (baseline) and peak-user (stress) conditions
- Identify system limitations (CPU, DB, network, memory)

### Key Metrics
- p50/p95/p99 response time
- Requests per second (RPS)
- Error rate
- CPU/Memory utilization
- DB query time and slow query count

### Response Time Interpretation
- User experience is considered acceptable when response time is under 2.0 seconds
- Example thresholds (adjust to your SLO):
	- 1.8s = Pass (acceptable performance)
	- 2.5s = Fail (noticeable lag and likely user frustration)
- High latency spikes (greater than 3.0s) do not always indicate core faults; they can be caused by external factors such as network instability or temporary load peaks
- Small, consistent improvements (around 100 ms) can materially improve user engagement

### Backend Endpoints to Test
- GET /profile
- POST /profile
- POST /skills
- POST /education
- POST /experience

### Frontend Pages/Flows to Test
- Profile page load (initial data fetch)
- Edit profile (save changes)
- Add skill (submit + refresh)
- Add education (submit + refresh)
- Add experience (submit + refresh)
- Upload profile picture

## Baseline Scenario (No Users)
### Setup
- No active user sessions
- One request at a time (serial)

### Test Procedure
- Run 100 requests per endpoint at 1 RPS
- Capture response time metrics and error rate

### Results
| Endpoint | p50 (ms) | p95 (ms) | p99 (ms) | Error Rate | Notes |
| --- | --- | --- | --- | --- | --- |
| GET /profile |  |  |  |  |  |
| POST /profile |  |  |  |  |  |
| POST /skills |  |  |  |  |  |
| POST /education |  |  |  |  |  |
| POST /experience |  |  |  |  |  |

### Observations
- Identify baseline bottlenecks (if any)
- Compare against the response time interpretation section

## Peak Scenario (High Concurrency)
### Definition of Peak
- Concurrent users:
- RPS target:
- Test duration:

### Ramp Plan
- Start at 10 users
- Increase by 10 users every 2 minutes
- Stop when p95 response time breaches SLO or error rate exceeds threshold

### Results
| Concurrency | RPS | p50 (ms) | p95 (ms) | p99 (ms) | Error Rate | CPU | Memory | DB Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 |  |  |  |  |  |  |  |  |
| 20 |  |  |  |  |  |  |  |  |
| 30 |  |  |  |  |  |  |  |  |

### Observations
- Note where response time crosses the 2.0s threshold
- Highlight spikes and possible external factors (network, DB lock contention)

## Capacity Findings
- Max sustainable RPS:
- Max concurrent users without SLO breach:
- Primary bottlenecks:

## Limitations and Assumptions
- Test data size:
- Caching enabled/disabled:
- External service dependencies:

## Recommendations
- Immediate fixes:
- Longer-term improvements:

## Appendix
- Test scripts location:
- Raw results:
- Chart images and dashboard screenshots:
