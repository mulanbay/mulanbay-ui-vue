<template>
  <div class="app-container">
    <el-form ref="remindForm" :model="remindForm" :rules="remindRules" label-width="150px">
      <el-form-item label="开始提醒设置" prop="formTimePassedRate">
        当时间过去
        <el-input-number v-model="remindForm.formTimePassedRate" style="width: 145px" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0"/>
        %时开始提醒
      </el-form-item>
      <el-form-item label="计划完成时提醒" prop="finishedRemind">
        <el-switch v-model="remindForm.finishedRemind"></el-switch>
      </el-form-item>
      <el-form-item label="提醒周期" prop="triggerInterval">
        每
        <el-input-number v-model="remindForm.triggerInterval" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" style="width: 100px"/>
        <el-select
          v-model="remindForm.triggerType"
          placeholder="周期"
          clearable
          collapse-tags
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in triggerTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        一次
      </el-form-item>
      <el-form-item label="提醒时间" prop="remindTime">
         <el-time-picker
            v-model="remindForm.remindTime"
            :picker-options="{
                  selectableRange: '00:00:00 - 23:59:00'
            }"
            format="HH:mm" value-format="HH:mm"
            placeholder="任意时间点">
          </el-time-picker>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
         <el-input type="textarea" style="width: 320px" v-model="remindForm.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" @click="submitRemindForm">确 定</el-button>
      <el-button @click="cancelRemind">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {getUserPlanRemind,addOrEditUserPlanRemind} from "@/api/report/plan/userPlan";

export default {
  name: "UserPlanRemind",
  props: {
    userPlanData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      remindForm:{},
      triggerTypeOptions:[
        {
          id: 'DAY',
          text: '天'
        },
        {
          id: 'WEEK',
          text: '周'
        },
        {
          id: 'MONTH',
          text: '月'
        }
      ],
      remindRules:{
        formTimePassedRate: [
          { required: true, message: "进度不能为空", trigger: "blur" }
        ],
        triggerType: [
          { required: true, message: "周期类型不能为空", trigger: "blur" }
        ],
        triggerInterval: [
          { required: true, message: "提醒周期不能为空", trigger: "blur" }
        ],
        remindTime: [
          { required: true, message: "提醒时间不能为空", trigger: "blur" }
        ],
        finishedRemind: [
          { required: true, message: "计划完成时提醒不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.loadRemind();
  },
  watch: {
    userPlanData: {
      deep: true,
      handler(val) {
        this.userPlanData =val;
        this.loadRemind();
      }
    }
  },
  methods: {
    //加载提醒
    loadRemind(){
      const userPlanId = this.userPlanData.id;
      if(this.isObjectEmpty(userPlanId)){
        this.msgError('无法绑定用户提醒信息');
        return;
      }
      getUserPlanRemind(userPlanId).then(response => {
        if(response!=null){
          this.remindForm = response;
        }else{
          var data ={};
          //设置默认值
          data.formTimePassedRate=50;
          data.finishedRemind=true;
          data.triggerInterval=1;
          data.triggerType='DAY';
          data.remindTime='08:30';
          this.remindForm = data;
        }
        this.remindForm.userPlanId = userPlanId;
        this.openRemind=true;
      });
    },
    //取消提醒
    cancelRemind(){
      this.$emit('closeMe');
    },
    //保存提醒
    submitRemindForm: function() {
      this.$refs["remindForm"].validate(valid => {
        if (valid) {
          addOrEditUserPlanRemind(this.remindForm).then(response => {
            this.msgSuccess("保存成功");
            this.$emit('closeMe');
          });
        }
      });
    }
  }
};
</script>
