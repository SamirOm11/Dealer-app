import nodemailer from "nodemailer";
import { json } from "@remix-run/node";

export const sendDealerEmail = async ({
  to,
  subject,
  text,
  base64Attachment,
  filename,
}) => {
  console.log(
    "SENDER_EMAIL raw value:",
    JSON.stringify(process.env.SENDER_EMAIL),
  );

  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  console.log("SENDER_EMAIL", SENDER_EMAIL);
  const APP_PASSWORD = process.env.APP_PASSWORD;
  console.log("APP_PASSWORD", APP_PASSWORD);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      logger: true,
      debug: true,
      secureConnection: true,
      auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    const mailOptions = {
      from: `Dealer App <${SENDER_EMAIL}>`,
      to,
      subject,
      text,
      attachments:
        base64Attachment && filename
          ? [
              {
                filename,
                content: base64Attachment,
                encoding: "base64",
              },
            ]
          : [],
    };

    console.log("mailOptions", mailOptions);
    const result = await transporter.sendMail(mailOptions);
    return json({ status: 200 }, { result });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
