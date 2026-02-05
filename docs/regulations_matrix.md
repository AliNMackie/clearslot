# Regulations Automation Matrix

This table maps the current manual processes for pilot legality and currency against the automated logic implemented in ClearSlot.

| Regulation / Requirement | Current Manual Process | ClearSlot Automated Logic |
| :--- | :--- | :--- |
| **NPPL 12-in-24** | Pilot manually counts hours in physical logbook for the last 24 months; Club Admin spot-checks. | **Rolling Calculation:** System sums valid flight minutes from digital logbook over the rolling 24-month window; flags "Non-Compliant" if <12 hours. |
| **90-Day Pax Currency** | Pilot remembers last landing; often guessed or checked in paper logbook before taking a passenger. | **Safety Lock:** System checks last 3 landings in logbook. If <3 in last 90 days, "Passenger" option is disabled in booking flow. |
| **Medical Expiry** | Pilot checks paper certificate date; Admin maintains a spreadsheet or relies on pilot honesty. | **Hard Expiry Check:** System stores expiry date. bookings blocked if slot date > medical expiry date. Automated renewal reminders sent 30 days prior. |
| **Permit / Inspection Dates** | Admin checks aircraft physical folder or whiteboard for annual permit expiry. | **Asset Status:** Aircraft marked "Unserviceable" automatically if current date > Permit Expiry. Booking prevented for expired aircraft. |
