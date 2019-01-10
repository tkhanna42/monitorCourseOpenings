# monitorCourseOpenings

A friend was monitoring course openings manually. I had too much time on my hands, and thought it'd be fun to automate it.

## Usage

For now, all notifications happen on the command line, which isn't very useful. But it can (hopefully) easily be modified to create a custom action (maybe trigger an API request? or hook it up with your machine's native notification tools, somehow). After this more modular, I'll eventually add an example.

### Install dependencies via
```
npm install
```

### Run with either
```
node monitorCourse {facultyCode} {courseCode} {termCode}
```

or

```
node monitorCourse {facultyCode}{courseCode} {termCode}
```

By default, running

```
node monitorCourse
```
is configured to monitor `CS 251` in term `1191`


## Email Notification Usage

### Set up email by setting the following keys in a `.env` file
```
GMAIL_ADDRESS=your_address
GMAIL_PASS=your_pass
```

Currently, gmail prevents you from logging into your account from insecure apps, like this one. I'll look into how this can be made 'secure', but for now, if you trust me (at your own risk, seriously read my code carefully... even if you do), one can disable google's security by following [this](https://codeburst.io/sending-an-email-using-nodemailer-gmail-7cfa0712a799)

Now just you can run the as above, but replace `node monitorCourse` with `node monitorCourseWithEmailNotification`

