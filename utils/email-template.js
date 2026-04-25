export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink,
  supportLink,
  daysLeft,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subscriptionName} - Renewal Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#4a90e2;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${subscriptionName}</h1>
              <p style="margin:8px 0 0;color:#cce0f7;font-size:14px;">Subscription Renewal Reminder</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 12px;font-size:16px;color:#222;">Hi <strong>${userName}</strong>,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
                Your <strong>${planName}</strong> subscription will automatically renew in
                <strong style="color:#4a90e2;">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
                Here's a quick summary:
              </p>

              <!-- Details -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background-color:#f5f8ff;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;">

                      <tr>
                        <td style="padding:10px 0;color:#888;">Plan</td>
                        <td style="padding:10px 0;text-align:right;font-weight:600;color:#222;">${planName}</td>
                      </tr>
                      <tr><td colspan="2" style="border-bottom:1px solid #e2eaf5;"></td></tr>

                      <tr>
                        <td style="padding:10px 0;color:#888;">Renewal Date</td>
                        <td style="padding:10px 0;text-align:right;font-weight:600;color:#222;">${renewalDate}</td>
                      </tr>
                      <tr><td colspan="2" style="border-bottom:1px solid #e2eaf5;"></td></tr>

                      <tr>
                        <td style="padding:10px 0;color:#888;">Amount</td>
                        <td style="padding:10px 0;text-align:right;font-weight:700;color:#4a90e2;font-size:16px;">${price}</td>
                      </tr>
                      <tr><td colspan="2" style="border-bottom:1px solid #e2eaf5;"></td></tr>

                      <tr>
                        <td style="padding:10px 0;color:#888;">Payment Method</td>
                        <td style="padding:10px 0;text-align:right;font-weight:600;color:#222;">${paymentMethod}</td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${accountSettingsLink}"
                      style="display:inline-block;background-color:#4a90e2;color:#ffffff;
                             text-decoration:none;padding:14px 36px;border-radius:6px;
                             font-weight:600;font-size:15px;letter-spacing:0.2px;">
                      Manage Subscription
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#777;line-height:1.6;">
                Questions? <a href="${supportLink}" style="color:#4a90e2;text-decoration:none;font-weight:500;">Contact our support team</a> — we're happy to help.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #eef0f3;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.8;">
                You're receiving this email because you have an active <strong>${subscriptionName}</strong> subscription.<br/>
                &copy; ${new Date().getFullYear()} ${subscriptionName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;