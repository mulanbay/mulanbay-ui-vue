<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历标题" prop="title">
            <el-input v-model="form.title" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历内容" prop="content">
            <el-input v-model="form.content" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="唯一标识" prop="bussIdentityKey">
            <el-input v-model="form.bussIdentityKey"  placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="周期类型" prop="period">
            <el-select
              v-model="form.period"
              placeholder="周期"
              clearable
              size="small"
              style="width: 240px"
              @change="loadPeriodValueOptions"
            >
              <el-option
                v-for="dict in periodOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="form.period == 'WEEKLY'||form.period == 'MONTHLY'" :span="24">
          <el-form-item label="周期值" prop="periodValues">
            <el-checkbox-group v-model="form.periodValues" @change="handlePeriodValuesChange">
              <el-checkbox v-for="pv in periodValueOptions" :label="pv.id" :key="pv.id">{{pv.text}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="绑定日历模板" prop="calendarConfigId">
           <treeselect
            v-model="form.calendarConfigId"
            @input="loadTemplate"
            style="width: 600px"
            :options="userCalendarConfigOptions"
            :disable-branch-nodes="true"
            :show-count="true"
            :searchable="true"
            :disabled="ncoDisabled"
            placeholder="请选择模板"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
          <span class="link-type" @click="msgAlert('提示','对于周期性的日历有效，绑定后在我的日历中可以查询是否已经完成')"><i class="el-icon-question" /></span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <form-create v-model="fApi" :option="fcOption"  :rule="fcRule"></form-create>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="bussDay">
            <el-date-picker type="datetime" v-model="form.bussDay" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过期时间" prop="expireTime">
            <el-date-picker type="datetime" v-model="form.expireTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="日历来源" prop="sourceType">
            <el-select
              v-model="form.sourceType"
              placeholder="周期"
              clearable
              size="small"
              style="width: 240px"
            >
              <el-option
                v-for="dict in sourceTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="全天日历" prop="allDay">
              <el-switch
                v-model="form.allDay">
              </el-switch>
              <span class="link-type" @click="msgAlert('提示','如果是全天日历，则预定时间里面的时分秒没有实际意义')"><i class="el-icon-question" /></span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="完成时间" prop="finishedTime">
              <el-date-picker type="datetime" v-model="form.finishedTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成类型" prop="finishType">
              <el-select
                v-model="form.finishType"
                placeholder="完成类型"
                clearable
                size="small"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in finishTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="地点">
            <el-input v-model="form.location" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

  </div>
</template>

<script>
  import {getUserCalendar,createUserCalendar,editUserCalendar} from "@/api/data/userCalendar";
  import {getUserCalendarConfigTree,getUserCalendarConfig} from "@/api/data/userCalendarConfig";

  import {getStatValueConfigs} from "@/api/report/statValueConfig";
  import {generateFcRules,getBindValues,setBindValues} from "@/utils/formCreateUtils";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import formCreate, { maker } from '@form-create/element-ui'

export default {
  name: "UserCalendarDetail",
  components: {
    Treeselect,
    formCreate:formCreate.$form()
  },
  props: {
      //父层带过来的信息值
      userCalendarData: {
        id:undefined
      }
  },
  data() {
    return {
      //预算列表
      periodOptions:[],
      periodValueOptions:[],
      userCalendarConfigOptions:[],
      sourceTypeOptions:[],
      finishTypeOptions:[],
      ncoDisabled:false,
      // formCreate属性start
      fcRule:[],
      fcOption:{
        submitBtn:false,
        form:{
          labelWidth:'120px',
          size:undefined,
          inline:true,
          hideRequiredAsterisk:false
        }
      },
      //表单对象
      fApi:{},
      // formCreate属性end
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
        period: [
          { required: true, message: "周期不能为空", trigger: "blur" }
        ],
        bussDay: [
          { required: true, message: "开始时间不能为空", trigger: "blur" }
        ],
        sourceType: [
          { required: true, message: "日历来源不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.userCalendarData);
  },
  //监听父层带过来的账户信息值
  watch:{
    userCalendarData: {
      deep: true,
      handler(val) {
        this.userCalendarData =val;
        this.handleReceiveData(this.userCalendarData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.initOptions();
      this.loadUserCalendar(data.id);
    },
    /** 查询下拉树结构 */
    initOptions() {
      this.getEnumTree('PeriodType', 'FIELD', false).then(response => {
        this.periodOptions = response;
      });
      getUserCalendarConfigTree(false).then(response => {
        this.userCalendarConfigOptions = response;
      });
      this.getEnumTree('UserCalendarSource', 'FIELD', false).then(response => {
        this.sourceTypeOptions = response;
      });
      this.getEnumTree('UserCalendarFinishType', 'FIELD', false).then(response => {
        this.finishTypeOptions = response;
      });
      this.periodValueOptions=[];
    },
    loadTemplate(newVal){
      /** 从模板加载 */
      if(this.isObjectEmpty(newVal)||this.form.id!=null){
        return;
      }
      //加载下来菜单配置项
      this.loadStatValueConfigs(newVal,'CALENDAR',null);
    },
    /** 获取值配置列表列表 */
    loadStatValueConfigs(fid,type,bindValues){
      getStatValueConfigs(fid,type).then(
        response => {
          const newRule = generateFcRules(response);
          //需要重载规则，否则编辑时无法设定值
          this.fApi.reload(newRule);
          setBindValues(bindValues,this.fApi);
        }
      );
    },
    //加载值的选项
    loadPeriodValueOptions(){
      if(this.form.period=='WEEKLY'){
        this.periodValueOptions = new Array();
        this.periodValueOptions.push({id:'1',text:'周一'});
        this.periodValueOptions.push({id:'2',text:'周二'});
        this.periodValueOptions.push({id:'3',text:'周三'});
        this.periodValueOptions.push({id:'4',text:'周四'});
        this.periodValueOptions.push({id:'5',text:'周五'});
        this.periodValueOptions.push({id:'6',text:'周六'});
        this.periodValueOptions.push({id:'7',text:'周日'});
      }else if(this.form.period=='MONTHLY'){
        this.periodValueOptions = new Array();
        for(let i=1;i<=31;i++){
          this.periodValueOptions.push({id:i+'',text:i+'号'});
        }
      }else{
        this.periodValueOptions=[];
      }

    },
    //周期值刷新
    handlePeriodValuesChange(){
      this.$forceUpdate();
    },
    //加载明细
    loadUserCalendar(id){
      if(id==undefined|| id==null){
        return;
      }
      getUserCalendar(id).then(response => {
        this.form = response;
        this.loadPeriodValueOptions();
        if(this.isObjectEmpty(response.periodValues)){
          this.form.periodValues=[];
        }else{
          //这里解析出来是字符数组，所以loadPeriodValueOptions方法里的id也需要是字符
          this.form.periodValues=response.periodValues.split(',');
        }
        //加载下来菜单配置项
        this.loadStatValueConfigs(this.form.calendarConfigId,'CALENDAR',this.form.bindValues);
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        bussIdentityKey: 'manual_'+(new Date().Format("yyyyMMddhhmmss")),
        sourceType: 'MANUAL',
        allDay:false,
        period:'ONCE'
      };
      this.resetForm("form");
      //初始化值
      this.form.periodValues=[];
    },
    // 取消按钮
    cancel() {
      //调用父组件的方法来关闭子组件
      this.$emit('closeMe');
    },
    /** 提交按钮 */
    submitForm: function() {
      //获取绑定值
      const bindValues = getBindValues(this.fApi);
      this.form.bindValues = bindValues;
      let pvs = this.form.periodValues;
      if(pvs!=null&&pvs.length>0){
        this.form.periodValues=pvs.join(',');
      }else{
        this.form.periodValues=undefined;
      }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            editUserCalendar(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.$emit('closeMe');
              this.$emit('refreshList');
            });
          } else {
            createUserCalendar(this.form).then(response => {
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
