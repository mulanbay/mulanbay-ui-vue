<template>
  <div class="app-container">
    <el-form ref="remindForm" :model="remindForm" :rules="remindRules" label-width="150px">
      <el-form-item label="提醒周期" prop="triggerInterval">
        每
        <el-input-number v-model="remindForm.triggerInterval" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" style="width: 100px"/>
        <el-select
          v-model="remindForm.triggerType"
          placeholder="周期"
          clearable
          collapse-tags
          size="small"
          style="width: 95px"
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
      <el-form-item label="超过告警值时提醒" prop="overWarningRemind">
        <el-switch v-model="remindForm.overWarningRemind"></el-switch>
      </el-form-item>
      <el-form-item label="超过警报值时提醒" prop="overAlertRemind">
        <el-switch v-model="remindForm.overAlertRemind"></el-switch>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
         <el-input type="textarea" style="width: 280px" v-model="remindForm.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" @click="submitRemindForm">确 定</el-button>
      <el-button @click="cancelRemind">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {getUserNotifyRemind,addOrEditUserNotifyRemind} from "@/api/report/notify/userNotify";

export default {
  name: "Remind",
  props: {
    userNotifyData: {
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
        triggerInterval: [
          { required: true, message: "提醒周期不能为空", trigger: "blur" }
        ],
        triggerType: [
          { required: true, message: "提醒周期不能为空", trigger: "blur" }
        ],
        remindTime: [
          { required: true, message: "提醒时间不能为空", trigger: "blur" }
        ],
        overWarningRemind: [
          { required: true, message: "超过告警值时提醒不能为空", trigger: "blur" }
        ],
        overAlertRemind: [
          { required: true, message: "超过警报值时提醒不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.loadRemind();
  },
  watch: {
    userNotifyData: {
      deep: true,
      handler(val) {
        this.userNotifyData =val;
        this.loadRemind();
      }
    }
  },
  methods: {
    //加载提醒
    loadRemind(){
      const userNotifyId = this.userNotifyData.id;
      if(this.isObjectEmpty(userNotifyId)){
        this.msgError('无法绑定用户提醒信息');
        return;
      }
      getUserNotifyRemind(userNotifyId).then(response => {
        if(response!=null){
          this.remindForm = response;
        }else{
          var data ={};
          //设置默认值
          data.overWarningRemind=true;
          data.overAlertRemind=true;
          data.triggerInterval=1;
          data.triggerType='DAY';
          data.remindTime='08:30';
          this.remindForm = data;
        }
        this.remindForm.userNotifyId = userNotifyId;
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
          addOrEditUserNotifyRemind(this.remindForm).then(response => {
            this.msgSuccess("保存成功");
            this.$emit('closeMe');
          });
        }
      });
    }
  }
};
</script>
