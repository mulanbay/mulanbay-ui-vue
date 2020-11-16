<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="queryParams.tags !=null" label="疾病标签" prop="tags">
        <el-input v-model="queryParams.tags" style="width: 240px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="检验日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="分析结果" prop="result">
        <el-select
          v-model="queryParams.result"
          filterable
          clearable
          default-first-option
          style="width: 120px"
          >
          <el-option
            v-for="dict in resultOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatTest:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['health:treat:treatTest:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:treat:treatTest:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatTest:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:treat:treatTest:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatTestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测项" min-width="160px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>&nbsp;
          <span class="link-type" @click="handleFiterName(row)"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="手术/检查项目" min-width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatOperation.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检查结果" align="center"  :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析结果" align="center">
        <template slot-scope="{row}">
          <span v-if="row.result == 'LOWER'">
           <span style="color:purple">{{ row.resultName }}</span>
          </span>
          <span v-else-if="row.result == 'NORMAL'">
           <span style="color:green">{{ row.resultName }}</span>
          </span>
          <span v-else-if="row.result == 'HIGHER'">
           <span style="color:red">{{ row.resultName }}</span>
          </span>
          <span v-else-if="row.result == 'DISEASE'">
           <span style="color:red">{{ row.resultName }}</span>
          </span>
          <span v-else>
           <span>--</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="参考范围" align="center" width="140">
        <template slot-scope="{row}">
          <span>{{ formatScope(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleStat(row)"><i class="el-icon-s-data"/></i></span>
        </template>
      </el-table-column>
      <el-table-column label="医院" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatOperation.treatRecord.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病标签" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.treatOperation.treatRecord.tags != null">
           <el-tag type="success">{{ row.treatOperation.treatRecord.tags }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="采样时间" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.testDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类/试验方法" align="center" width="140">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatOperation.treatRecord.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官" align="center">
        <template slot-scope="{row}">
          <span>{{ row.treatOperation.treatRecord.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:treat:treatTest:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatTest:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="检验项目" prop="name">
              <el-select
                v-model="form.name"
                filterable
                allow-create
                default-first-option
                :style="{width: '520px'}"
                @change="loadProperties"
                >
                <el-option
                  v-for="dict in nameOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="检测结果" prop="value">
              <el-input v-model="form.value" placeholder="" :style="{width: '520px'}"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="参考范围" prop="minValue">
              <el-input-number v-model="form.minValue" controls-position="right" :style="{width: '120px'}" :min="0" :controls="true" :precision="3"/>
              ~~
              <el-input-number v-model="form.maxValue" controls-position="right" :style="{width: '120px'}" :min="0" :controls="true" :precision="3"/>
              单位:<el-input v-model="form.unit" :style="{width: '100px'}" placeholder="" />
              (针对数字区间类)
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="参考范围" prop="referScope">
              <el-input v-model="form.referScope" placeholder="" :style="{width: '400px'}"/>
               (针对字符类)
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="分析结果" prop="result">
              <el-select
                v-model="form.result"
                filterable
                allow-create
                default-first-option
                >
                <el-option
                  v-for="dict in resultOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采集时间" prop="testDate">
              <el-date-picker type="datetime" v-model="form.testDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :style="{width: '520px'}" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(true)" v-if="this.form.id==null">保存并继续</el-button>
        <el-button type="primary" @click="submitForm(false)">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 统计页面 -->
    <el-dialog :title="statTitle" width="900px" :visible.sync="statVisible"  append-to-body>
      <treat-test-stat
        :statTreatTestData="statTreatTestData"
      />
    </el-dialog>


  </div>
</template>

<script>
import {fetchList,getLastTreatTest,getTreatTestCategoryTree,getTreatTest,createTreatTest,updateTreatTest,deleteTreatTest} from "@/api/health/treat/treatTest";
import {copyObject,getQueryObject} from "@/utils/index";
import TreatTestStat from './stat'

export default {
  name: "TreatTest",
  components: {
    'treat-test-stat':TreatTestStat
  },
  props: {
      //父层带过来的预算信息值
      operationForTestListData:{
        treatOperationId:undefined
      }
  },
  data() {
    return {
      //统计相关 start
      statTitle:'',
      statVisible:false,
      statTreatTestData:{
        name:undefined
      },
      //统计相关 end
      //继续添加模式
      continueAdd : false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      treatTestList:[],
      nameOptions:[],
      resultOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        treatOperationId:undefined
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        value: [
          { required: true, message: "检查结果不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    let qb = getQueryObject(null);
    this.queryParams.tags = qb.tags;
    this.handleReceiveData(this.operationForTestListData);
    this.getList();
    //检验结果列表
    this.getEnumTree('TreatTestResult','FIELD',false).then(response => {
      this.resultOptions = response;
    });
  },
  //监听父层带过来的账户信息值
  watch:{
    operationForTestListData(newVal,oldVal){
      this.handleReceiveData(newVal);
      this.getList();
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      //console.log("test treatOperation:"+JSON.stringify(data));
      if(!this.isObjectEmpty(data)){
        this.queryParams.treatOperationId=data.treatOperationId;
      }
    },
    /** 过滤名称操作 */
    handleFiterName(row){
      this.queryParams.name=row.name;
      this.handleQuery();
    },
    /** 检验项目操作 */
    handleStat(row){
      this.statTitle="统计";
      this.statVisible=true;
      this.statTreatTestData = Object.assign({}, this.statTreatTestData, {
        name:row.name
      });
    },
    getTreatTestCategoryTreeselect(){
      getTreatTestCategoryTree(false).then(response => {
        this.nameOptions = response;
      });
    },
    //从已经有的用药记录加载
    loadProperties(newVal){
      if(!this.isObjectEmpty(this.form.id)){
        //修改类不需要
        return;
      }
      //加载复制详情
      getLastTreatTest(newVal).then(response => {
        if(response!=null){
          const date = this.form.testDate;
          copyObject(response,this.form);
          this.form.treatOperationId=this.queryParams.treatOperationId;
          this.form.testDate = date;
          this.form.id = undefined;
          this.form.result = undefined;
          this.form.value = undefined;
        }
      });
    },
    /** 检查范围 */
    formatScope(row){
      if(row.minValue!=null){
        return row.minValue+'~'+row.maxValue+(row.unit ==null ? '':row.unit);
      }else if(row.referScope!=null){
        return row.referScope;
      }else {
        return '--';
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.treatTestList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        treatOperationId:undefined,
        unit:undefined,
        value:undefined,
        minValue:undefined,
        maxValue:undefined,
        referScope:undefined,
        testDate:undefined,
        result: undefined,
        typeName:undefined,
        remark:undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleCreate() {
      if(this.isObjectEmpty(this.queryParams.treatOperationId)){
        this.msgError("无法绑定手术信息，请前往手术管理或看病记录管理页面新增");
        return;
      }
      this.reset();
      this.continueAdd = false;
      //设置外键
      this.form.treatOperationId=this.queryParams.treatOperationId;
      this.getTreatTestCategoryTreeselect();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.continueAdd = false;
      this.getTreatTestCategoryTreeselect();
      const id = row.id || this.ids.join(",")
      getTreatTest(id).then(response => {
        copyObject(response,this.form);
        this.form.treatOperationId=response.treatOperation.id;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 处理保存并继续 */
    handleContinueAdd(){
      this.open = true;
      const date = this.form.testDate;
      this.handleCreate();
      this.form.testDate = date;
    },
    /** 提交按钮 */
    submitForm(ca) {
      this.continueAdd = ca;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTreatTest(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              if(true==ca){
                this.handleContinueAdd();
              }
            });
          } else {
            createTreatTest(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              if(true==ca){
                this.handleContinueAdd();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteTreatTest(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有购买来源数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportTreatTest(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
