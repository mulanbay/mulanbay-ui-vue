<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="档案标题" prop="title">
             <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="档案内容" prop="content">
              <el-input v-model="form.content" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="bussType">
              <el-select v-model="form.bussType" placeholder="请选择">
                <el-option
                  v-for="dict in bussTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="date">
              <el-date-picker type="datetime" v-model="form.date" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="绑定的类">
              <el-select v-model="form.relatedBeans" placeholder="请选择">
                <el-option
                  v-for="dict in beanNameOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原始ID" prop="sourceId">
              <el-input-number v-model="form.sourceId" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
  </div>
</template>

<script>
  import {createLifeArchives,updateLifeArchives} from "@/api/life/lifeArchives";
  import {getNowDateTimeString} from "@/utils/datetime";
  import {getDomainClassNamesTree} from "@/api/auth/systemFunction";

export default {
  name: "Detail",
  props: {
      //父层带过来的信息值
      lifeArchivesData:{
        id:undefined
      },
  },
  data() {
    return {
      loading:false,
      bussTypeOptions:[],
      beanNameOptions:[],
      // 表单参数
      form: {
        id:undefined
      },
      // 表单校验
      rules: {
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
        date: [
          { required: true, message: "发生时间不能为空", trigger: "blur" }
        ],
        bussType: [
          { required: true, message: "业务类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getEnumTree('BussType','FIELD',false).then(response => {
      this.bussTypeOptions = response;
    });
    getDomainClassNamesTree().then(response => {
      this.beanNameOptions = response;
    });
    this.handleReceiveData(this.lifeArchivesData);
  },
  //监听父层带过来的账户信息值
  watch:{
    lifeArchivesData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.form = data;
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      //调用父组件的方法来关闭子组件
      this.$emit('closeMe');
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLifeArchives(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          } else {
            createLifeArchives(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          }
        }
      });
    }
  }
};
</script>
