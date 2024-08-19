import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity("GroupForm")
export class GroupForm {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("simple-array")
  data!: object[];
}
