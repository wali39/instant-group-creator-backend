import express = require("express");
import cookieParser = require("cookie-parser");
import logger = require("morgan");
import cors from "cors";
const debug = require("debug")("app");
import { createConnection, getConnection } from "typeorm";

const app = express();
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { GroupForm } from "./entity/groupform";

createConnection({
  type: "sqlite",
  database: "./db.sqlite",
  entities: [GroupForm],
  synchronize: true,
});

let dataList: object[] = [];
let TotalGroup: number;
let totalStudent: number;
let studentInGroup: number;

app
  .route("/")
  .get(async (req: express.Request, res: express.Response) => {
    const groupformRepository = getConnection().getRepository(GroupForm);
    const findall = await groupformRepository.find();
    res.status(200).json({
      data: dataList,
      group: TotalGroup,
      totalStudent,
      studentInGroup,
    });
  })
  .post(async (req: express.Request, res: express.Response) => {
    const {
      batch,
      startRoll,
      lastRoll,
      skipRoll,
      studentPerGroup,
      prevYearBatch,
      prevYearRoll,
      DisciplineCode,
    } = req.body;

    const studentList = [];

    for (let i = parseInt(startRoll); i < parseInt(lastRoll) + 1; i++) {
      studentList.push(
        i > 9
          ? `${batch}${DisciplineCode}${i}`
          : `${batch}${DisciplineCode}0${i}`
      );
    }

    const skipStudentRoll: string[] = [];
    for (let i = 0; i < skipRoll.length; i++) {
      skipStudentRoll.push(`${batch}${DisciplineCode}${skipRoll[i]}`);
    }

    const updatedList = studentList.filter(
      (item) => !skipStudentRoll.includes(item)
    );
    if (prevYearBatch && prevYearRoll) {
      for (let i = 0; i < prevYearRoll.length; i++) {
        updatedList.push(`${prevYearBatch}${DisciplineCode}${prevYearRoll[i]}`);
      }
    }

    interface studentObj {
      groupN: number;
      studentArr: string[];
    }
    let temparr = [];
    let groupNumber = 1;
    let totalGroup = 0;
    let count = 0;
    let studentListUpdate: studentObj[] = [];
    for (let i = 0; i < updatedList.length; i++) {
      temparr.push(updatedList[i]);
      count++;
      if (count === parseInt(studentPerGroup)) {
        totalGroup++;
        let individualstudent: studentObj = {
          groupN: groupNumber,
          studentArr: temparr,
        };
        studentListUpdate.push(individualstudent);
        temparr = [];
        count = 0;
        groupNumber = groupNumber + 1;
      } else if (
        i === updatedList.length - 1 &&
        count !== parseInt(studentPerGroup)
      ) {
        totalGroup++;
        let individualstudent: studentObj = {
          groupN: groupNumber,
          studentArr: temparr,
        };
        studentListUpdate.push(individualstudent);
        temparr = [];
        count = 0;
        groupNumber = groupNumber + 1;
      }
    }
    dataList = studentListUpdate;
    TotalGroup = totalGroup;
    totalStudent = updatedList.length;
    studentInGroup = parseInt(studentPerGroup);
    res.status(200).json({
      success: true,
      message: "created successfully",
    });
  });

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Backend app listening at ${port}`);
});
