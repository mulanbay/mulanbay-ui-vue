<template>
  <div class="app-container">
      <el-form  ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="同时更新等级" >
            <el-checkbox v-model="form.updateLevel"></el-checkbox>
        </el-form-item>
      </el-form>
      <!--列表数据-->
      <el-table  v-loading="loading"  :data="dataList" >
        <el-table-column label="项目" prop="key" align="center">
          <template slot-scope="{row}">
            <span>{{ row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" prop="level" align="center">
          <template slot-scope="{row}">
            <span>{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="name" align="center">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
      </el-table>
      <br><br>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm" v-hasPermi="['config:levelConfig:selfJudge']">评 定</el-button>
      </div>
  </div>
</template>

<script>
  import {selfJudge} from "@/api/config/levelConfig";

export default {
  name: "SelfJudge",
  data() {
    return {
      dataList:[],
      loading:false,
      form:{
        updateLevel:false
      },
      // 表单校验
      rules: {
        updateLevel: [
          { required: true, message: "更新等级不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.submitForm();
  },
  methods: {
    /** 提交按钮 */
    submitForm: function() {
      this.loading=true;
      selfJudge(this.form).then(response => {
        this.dataList = new Array();
        let cl ={
          key:'原来的用户等级',
          level:response.currentLevel.level,
          name:response.currentLevel.name
        };
        this.dataList.push(cl);
        if(response.newLevel){
          let nl ={
            key:'新评定用户等级',
            level:response.newLevel.level,
            name:response.newLevel.name
          };
          this.dataList.push(nl);
        }else{
          let nl ={
            key:'新评定用户等级',
            level:'低于最低要求',
            name:'--'
          };
          this.dataList.push(nl);
        }
        this.loading=false;
        if(this.form.updateLevel==true){
          this.msgSuccess('更新等级成功');
        }
      });
    }
  }
};
</script>
