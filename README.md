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

