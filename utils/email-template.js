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
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color:#ffffff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#4a90e2;padding:12px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">SubDub</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <p style="margin:0 0 24px;font-size:14px;color:#333;">Hello <span style="color:#4a90e2;">${userName}</span>,</p>
              
              <p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.6;">
                Your <strong>${subscriptionName}</strong> subscription is set to renew on <span style="color:#4a90e2;font-weight:500;">${renewalDate}</span> (${daysLeft} days from today).
              </p>

              <!-- Details Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f8fc;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:0 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;color:#333;">
                      <tr>
                        <td style="padding:16px 0;"><strong>Plan:</strong> ${planName}</td>
                      </tr>
                      <tr><td style="border-bottom:1px solid #e5eaf2;"></td></tr>
                      <tr>
                        <td style="padding:16px 0;"><strong>Price:</strong> ${price}</td>
                      </tr>
                      <tr><td style="border-bottom:1px solid #e5eaf2;"></td></tr>
                      <tr>
                        <td style="padding:16px 0;"><strong>Payment Method:</strong> ${paymentMethod}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#333;line-height:1.6;">
                If you'd like to make changes or cancel your subscription, please visit your <a href="${accountSettingsLink}" style="color:#4a90e2;text-decoration:none;">account settings</a> before the renewal date.
              </p>

              <p style="margin:0 0 32px;font-size:14px;color:#333;line-height:1.6;">
                Need help? <a href="${supportLink}" style="color:#4a90e2;text-decoration:none;">Contact our support team</a> anytime.
              </p>

              <p style="margin:0 0 8px;font-size:14px;color:#333;">Best regards,</p>
              <p style="margin:0;font-size:14px;color:#333;font-weight:700;">The SubDub Team</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fbfd;padding:24px 40px;text-align:center;border-top:1px solid #f0f4f8;">
              <p style="margin:0 0 12px;font-size:12px;color:#555;">
                SubDub Inc. | 123 Main St, Anytown, AN 12345
              </p>
              <p style="margin:0;font-size:12px;color:#90bce9;">
                <a href="#" style="color:#90bce9;text-decoration:none;">Unsubscribe</a> &nbsp;|&nbsp; 
                <a href="#" style="color:#90bce9;text-decoration:none;">Privacy Policy</a> &nbsp;|&nbsp; 
                <a href="#" style="color:#90bce9;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;;