<template>
  <div class="app-container">
    <el-form ref="remindForm" :model="remindForm" :rules="remindRules" label-width="120px">
      <el-form-item label="开始提醒设置" prop="formRate">
        当进度未达到
        <el-input-number v-model="remindForm.formRate" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0"/>
        %时开始提醒
      </el-form-item>
      <el-form-item label="距离天数设置" prop="fromProposedDays">
        距离期望日期
        <el-input-number v-model="remindForm.fromProposedDays" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0"/>
        天时开始提醒
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
                  selectableRange: '18:30:00 - 20:30:00'
            }"
            format="HH:mm" value-format="HH:mm"
            placeholder="任意时间点">
          </el-time-picker>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
         <el-input type="textarea" v-model="remindForm.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" @click="submitRemindForm">确 定</el-button>
      <el-button @click="cancelRemind">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {addOrEditDreamRemind,getDreamRemind} from "@/api/dream/dream";

export default {
  name: "DreamRemind",
  props: {
    dreamData: {
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
        formRate: [
          { required: true, message: "开始进度不能为空", trigger: "blur" }
        ],
        fromProposedDays: [
          { required: true, message: "距离天数设置不能为空", trigger: "blur" }
        ],
        finishedRemind: [
          { required: true, message: "计划完成时提醒不能为空", trigger: "blur" }
        ],
        triggerInterval: [
          { required: true, message: "提醒周期不能为空", trigger: "blur" }
        ],
        triggerType: [
          { required: true, message: "提醒周期不能为空", trigger: "blur" }
        ],
        remindTime: [
          { required: true, message: "提醒时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.loadRemind();
  },
  watch: {
    dreamData: {
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
      const dreamId = this.dreamData.id;
      if(this.isObjectEmpty(dreamId)){
        this.msgError('无法绑定用户提醒信息');
        return;
      }
      getDreamRemind(dreamId).then(response => {
        if(response!=null){
          this.remindForm = response;
        }else{
          var data ={};
          //设置默认值
          data.formRate=50;
          data.fromProposedDays=90;
          data.finishedRemind=true;
          data.triggerInterval=1;
          data.triggerType='DAY';
          data.remindTime='08:30';
          this.remindForm = data;
        }
        this.remindForm.dreamId = dreamId;
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
          addOrEditDreamRemind(this.remindForm).then(response => {
            this.msgSuccess("保存成功");
            this.$emit('closeMe');
          });
        }
      });
    }
  }
};
</script>
