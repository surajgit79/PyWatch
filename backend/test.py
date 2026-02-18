import smtplib
import os

server = smtplib.SMTP("smtp.gmail.com", 587)
server.starttls()
server.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
