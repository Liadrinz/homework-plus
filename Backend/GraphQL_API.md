# GraphQL API

### 1. UserType (用户)

### 1) query

### 可以查询的字段
```gql
{
  dateJoined: DateTime
  buptId: String
  name: String
  email: String
  phone: String
  gender: "male" or "female"
  usertype: "teacher" or "student"
  classNumber: String
  wechat: String
  forgotten: Boolean
}
```

### query 的方法
#### allUsers
##### 权限
需要登录
##### 参数
```gql
()
```
##### 用法
```gql
query {
  allUsers {
    // 需要查询的字段
  }
}
```

#### getUsersByIds
##### 权限
需要登录
##### 参数
```gql
(ids: List<Int>)
```
##### 用法
```gql
query {
  getUsersByIds(ids: 指定id列表) {
    // 需要查询的字段
  }
}

#### getUsersByUsernames
##### 权限
需要登录
##### 参数
```gql
(usernames: List<String>)
```
##### 用法
```gql
query {
  getUsersByUsernames(usernames: 指定username列表) {
    // 需要查询的字段
  }
}

#### getUsersByBuptIds
##### 权限
需要登录
##### 参数
```gql
(buptIds: List<String>)
```
##### 用法
```gql
query {
  getUsersByBuptIds(buptIds: 指定buptId列表) {
    // 需要查询的字段
  }
}
```

#### getUsersByNames
##### 权限
需要登录
##### 参数
```gql
(names: List<String>)
```
##### 用法
```gql
query {
  getUsersByNames(names: 指定name列表) {
    // 需要查询的字段
  }
}
```

#### getUsersByCourseId
##### 权限
需要登录
##### 参数
```gql
(courseId: Int)
```
##### 用法
```gql
query {
  getUsersByCourseId(courseId: 指定课程id) {
    // 需要查询的字段
  }
}

### 2) mutation

### mutation 的方法

#### editUser
##### 权限
需要用户本人
##### 参数
```gql
(userData: {
  username: String,
  classNumber: String,
  phone: String
})
```
##### 返回字段
```gql
{
  ok: Boolean
  msg: String,
  user: UserType
}
```
##### 用法
```gql
mutation {
  editUser(userData: {
    // 参数字段
  }) {
    // 返回字段
  }
}
```

### 2. CourseType (课程)

### 1) query

### 可以查询的字段 (非基础类型的字段都需要展开)
```gql
{
  id: Int
  name: String
  description: String
  school: String
  marks: Float
  startTime: DateTime
  endTime: DateTime
  teachers: List<UserType>
  teachingAssistants: List<UserType>
  students: List<UserType>
}
```

### query 的方法
#### allCourses
##### 权限
需要登录
##### 参数
```gql
()
```
##### 用法
```gql
query {
  allCourses {
    // 需要查询的字段
  }
}
```

#### getCoursesByIds
##### 权限
需要登录
##### 参数
```gql
(ids: List<Int>)
```
##### 用法
```gql
query {
  getCoursesByIds(ids: 指定id列表) {
    // 需要查询的字段
  }
}
```

#### searchCoursesByKeywords
##### 权限
需要登录
##### 参数
```gql
(keywords: String)
```
##### 用法
```gql
query {
  searchCoursesByKeywords(keywords: 指定关键字) {
    // 需要查询的字段
  }
}
```

#### searchCoursesByName
##### 权限
需要登录
##### 参数
```gql
(name: String)
```
##### 用法
```gql
query {
  searchCoursesByName(name: 指定名称) {
    // 需要查询的字段
  }
}
```

#### searchCoursesByTeacherName
##### 权限
需要登录
##### 参数
```gql
(teacherName: String)
```
##### 用法
```gql
query {
  searchCoursesByTeacherName(teacherName: 指定老师名称) {
    // 需要查询的字段
  }
}
```

### 2) mutation

#### mutation 的方法

#### createCourse
##### 权限
需要老师身份
##### 参数
```gql
(courseData: {
  name: String!
  description: String!
  marks: Float!
  teachers: List<Int>!,
  teachingAssistants: List<Int>!,
  students: List<Int>!,
  school: String!,
  startTime: DateTime!,
  endTime: DateTime!
})
```
##### 返回字段
```gql
{
  ok: Boolean,
  msg: String,
  course: CourseType
}
```
##### 用法
```gql
mutation {
  createCourse(courseData: {
    // 参数字段
  }) {
    // 需要的返回字段
  }
}
```

#### editCourse
##### 权限
需要该课教师或助教 <br>
教师权限: 可修改以下所有字段 <br>
助教权限: 可修改除name, teachers, teachingAssistants之外的字段
##### 参数
```gql
(courseData: {
  name: String
  description: String
  marks: Float
  teachers: List<Int>,  // 只增不减
  teachingAssistants: List<Int>,  // 只增不减
  students: List<Int>,  // 只增不减
  school: String!,
  startTime: DateTime!,
  endTime: DateTime!
})
```
##### 返回字段
```gql
{
  ok: Boolean,
  msg: String,
  course: CourseType
}
```
##### 用法
```gql
mutation {
  editCourse(courseData: {
    // 参数字段
  }) {
    // 需要的返回字段
  }
}
```

### 3. AssignmentType (老师布置的作业)

### 1) query

### 可以查询的字段 (非基础类型的字段都需要展开)
```gql
{
  id: Int
  name: String
  description: String
  assignmentType: String
  startTime: String
  deadline: DateTime
  courseClass: CourseType
  addfile: FileType
}
```

### query 的方法
#### allAssignments
##### 权限
需要登录
##### 参数
```gql
()
```
##### 用法
```gql
query {
  allAssignments {
    // 需要查询的字段
  }
}
```

#### getAssignmentsByIds
##### 权限
需要登录
##### 参数
```gql
(ids: List<Int>)
```
##### 用法
```gql
query {
  getAssignmentsByIds(ids: 需要查询的id的列表) {
    // 需要查询的字段
  }
}
```

#### getAssignmentsByCourses
##### 权限
需要登录
##### 参数
```gql
(courses: List<Int>)
```
##### 用法
```gql
query {
  getAssignmentsByCourses(courses: 指定课程的id列表) {
    // 需要查询的字段
  }
}
```

#### getAssignmentsByDeadline (查找ddl在某个日期之前的所有作业)
##### 权限
需要登录
##### 参数
```gql
(deadline: DateTime)
```
##### 用法
```gql
query {
  getAssignmentsByDeadline(deadline: 指定日期) {
    // 需要查询的字段
  }
}
```

#### getAssignmentsByName
##### 权限
需要登录
##### 参数
```gql
(name: String)
```
##### 用法
```gql
query {
  getAssignmentsByName(name: 指定名称) {
    // 需要查询的字段
  }
}
```

#### getAssignmentsByKeywords (模糊搜索)
##### 权限
需要登录
##### 参数
```gql
(keywords: String)
```
##### 用法
```gql
query {
  getAssignmentsByKeywords(keywords: 指定关键词) {
    // 需要查询的字段
  }
}
```

### 2) mutation

### mutation 的方法

#### createAssignment
##### 权限
需要该课老师或助教
##### 参数
```gql
(assignmentData: {
  courseClass: Int! // 对应课程的id
  name: String!
  description: String!
  assignmentType: "image" or "docs" or "vary"!
  deadline: DateTime!
  addfile: List<Int>!
})
```
##### 返回字段
```gql
{
  ok: Boolean
  msg: String // 提示信息
  assignment: AssignmentType
}
```
##### 用法
```gql
mutation {
  createAssignment(assginmentData: {
    // 参数字段
  }) {
    // 需要的返回字段
  }
}
```

#### editAssignment
##### 权限
需要该课老师或助教
##### 参数
```gql
(assignmentData: {
  id: Int!  // 所需修改对象的id
  name: String
  description: String
  assignmentType: "image" or "docs" or "vary"
  deadline: DateTime
  addfile: List<Int>
})
```
##### 返回字段
```gql
{
  ok: Boolean
  msg: String // 提示信息
  assignment: AssignmentType
}
```
##### 用法
```gql
mutation {
  editAssignment(assginmentData: {
    // 参数字段
  }) {
    // 需要的返回字段
  }
}
```

#### deleteAssignment
##### 权限
需要该课老师
##### 参数
```gql
(assignmentData: {
  ids: Lits<Int>!  // 所需删除的所有对象的id列表
})
```
##### 返回字段
```gql
{
  ok: Boolean
  msg: String // 提示信息
  assignments: List<AssignmentType>  // 删掉的assignments
}
```
##### 用法
```gql
mutation {
  deleteAssignment(assginmentData: {
    // 参数字段
  }) {
    // 需要的返回字段
  }
}
```

### 4. SubmissionType (学生提交的作业)

### 1) query

### 可以查询的字段
```gql
{
  aware: Boolean
  description: String
  score: Float
  isExcellent: Boolean
  image: FileType
  pdf: FileType
  addfile: FileType
  submitTime: DateTime
  assignment: AssignmentType
  submitter: UserType
}
```

### query 的方法
#### allSubmissions
##### 权限
需要登录
##### 参数
```gql
()
```
##### 用法
```gql
query {
  allSubmissions {
    // 需要查询的字段
  }
}
```

#### getSubmissionsByOwners
##### 权限
需要登录
##### 参数
```gql
(owners: List<Int>)
```
##### 用法
```gql
query {
  getSubmissionsByOwners(owners: 指定提交者的id列表) {
    // 需要查询的字段
  }
}
```

#### getSubmissionsByAssignments
##### 权限
需要登录
##### 参数
```gql
(assignments: List<Int>)
```
##### 用法
```gql
query {
  getSubmissionsByAssignments(assignments: 指定老师布置的作业的id列表) {
    // 需要查询的字段
  }
}
```

#### getSubmissionsByCourses
##### 权限
需要登录
##### 参数
```gql
(courses: List<Int>)
```
##### 用法
```gql
query {
  getSubmissionsByCourses(courses: 指定课程的id列表) {
    // 需要查询的字段
  }
}
```
