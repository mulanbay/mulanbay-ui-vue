<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="moreCdn==true" label="手术名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in tagsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="名称检索" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="请输入名称"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
      </el-form-item>
      <el-form-item  v-if="queryParams.treatRecordId==null" label="手术日期">
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
      <el-form-item v-if="moreCdn==true" label="疾病名称" prop="disease">
        <el-select
          v-model="queryParams.disease"
          placeholder="疾病名称"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in diseaseOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatOperation:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="createDisable"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['health:treat:treatOperation:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:treat:treatOperation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treatOperation:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:treat:treatOperation:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleStat"
          v-hasPermi="['health:treat:treatOperation:stat']"
        >统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatOperationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手术/检查项目" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测报告" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleTreatTest(row)"><i class="el-icon-s-grid"/></i></span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.treatRecord.diagnosedDisease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="费用">
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.fee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手术/检查日期" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ formatTreatDate(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="距离现在" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.tdDays>=365" style="color: red;">
           {{ row.tdDaysStr }}
          </span>
          <span v-else-if="row.tdDays>=90" style="color: purple;">
           {{ row.tdDaysStr }}
          </span>
          <span v-else-if="row.tdDays>=30" style="color: green;">
           {{ row.tdDaysStr }}
          </span>
          <span v-else>
           {{ row.tdDaysStr }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="复查日期" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span v-if="row.rdDays>=365" style="color: black;">
           {{ row.reviewDate }}
          </span>
          <span v-else-if="row.tdDays>=90" style="color: purple;">
           {{ row.reviewDate }}
          </span>
          <span v-else-if="row.tdDays>=30" style="color: #8b008b;">
           {{ row.reviewDate }}
          </span>
          <span v-else style="color: red;">
           {{ row.reviewDate }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.available" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否有病" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.isSick" disabled=""></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="分类" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:treat:treatOperation:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatOperation:delete']"
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

    <!-- 手术表单页面 -->
    <el-dialog :title="title" width="600px" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="手术名称" prop="name">
                <el-select
                  v-model="form.name"
                  filterable
                  allow-create
                  default-first-option
                  :style="{width: '100%'}">
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
            <el-col :span="12">
              <el-form-item label="手术分类" prop="category">
                <el-select
                  v-model="form.category"
                  :style="{width: '100%'}"
                  filterable
                  allow-create
                  default-first-option>
                  <el-option
                    v-for="dict in categoryOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手术费用" prop="fee">
                <el-input-number v-model="form.fee" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="2"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="看病日期" prop="treatDate">
                <el-date-picker type="date" v-model="form.treatDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="复查日期" prop="reviewDate">
                <el-date-picker type="date" v-model="form.reviewDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                          :style="{width: '100%'}" placeholder="请选择时间" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="是否有效" prop="available">
                <el-switch v-model="form.available"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否有病" prop="isSick">
                <el-switch v-model="form.isSick"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="submitForm">保 存</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>

    <!-- 检验报告列表页面 -->
    <el-dialog :title="testListTitle" width="900px" :visible.sync="testListVisible"  append-to-body>
      <treat-test-list :operationForTestListData="operationForTestListData"/>
    </el-dialog>

    <!-- 手术统计列表页面 -->
    <el-dialog :title="statListTitle" width="780px" :visible.sync="statListVisible"  append-to-body customClass="customDialogCss">
      <stat-list/>
    </el-dialog>

  </div>
</template>

<script>
import {getTreatRecordTagsTree,getTreatCategoryTree} from "@/api/health/treat/treatRecord";
import {fetchList,getTreatOperationCategoryTree,getTreatOperation,createTreatOperation,updateTreatOperation,deleteTreatOperation} from "@/api/health/treat/treatOperation";
import {formatDays,getDay} from "@/utils/datetime";
import TreatTestList from '../treatTest/index'
import StatList from './stat'

export default {
  name: "TreatOperation",
  components: {
    'treat-test-list':TreatTestList,
    'stat-list':StatList
  },
  props: {
    //父层带过来的账户信息值
    treatRecordData:{
      id:undefined
    }
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //手术表单
      operationTitle:'',
      operationVisible:false,
      //给药品信息使用的外键v
      treatForOperationData:{
        id:undefined,
        treatRecordId:undefined
      },
      //表单页面修改
      title:'',
      open:false,
      //新增的按钮状态
      createDisable:true,

      //检验报告相关 start
      testListTitle:'',
      testListVisible:false,
      operationForTestListData:{
        treatOperationId:undefined
      },
      //检验报告相关 end
      //手术统计 start
      statListTitle:'',
      statListVisible:false,
      //手术统计 end
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
      treatOperationList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined
      },
      booleanOptions:this.booleanOptions,
      //疾病标签
      tagsOptions:[],
      //看病类型
      diseaseOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //手术名称列表
      nameOptions:[],
      categoryOptions:[],
      loading:false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        category: [
          { required: true, message: "分类不能为空", trigger: "blur" }
        ],
        treatDate: [
          { required: true, message: "看病时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatRecordData);
    this.getTreatRecordTagsTreeselect();
    this.getDiseaseTreeselect();
  },
  //监听父层带过来的账户信息值
  watch:{
    treatRecordData(newVal,oldVal){
      this.treatRecordData = newVal;
      this.handleReceiveData(this.treatRecordData);
    }
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data!=null){
        this.queryParams.treatRecordId=this.treatRecordData.id;
        this.createDisable= false;
      }
      this.getList();
    },
    /** 商品名称 */
    formatTreatDate(row) {
      //先计算出days供下面的方法使用
      const nowTime = new Date();
      const td = new Date(Date.parse(row.treatDate.replace(/-/g,"/")));
      const tdDays = (parseInt(nowTime - td)) / (1000*24*3600);
      const tdDaysStr = formatDays(tdDays);
      row.tdDays=tdDays;
      row.tdDaysStr=tdDaysStr;
      if(!this.isObjectEmpty(row.reviewDate)){
        const rd = new Date(Date.parse(row.treatDate.replace(/-/g,"/")));
        const rdDays = (parseInt(nowTime - rd)) / (1000*24*3600);
        row.rdDays = rdDays;
      }
      return row.treatDate;
    },
    /** 初始化下拉树结构 */
    initOptionList(){
      getTreatOperationCategoryTree('name',false).then(response => {
        this.nameOptions = response;
      });
      this.getDictItemTree('OPERATION_CATEGORY',false).then(response => {
        this.categoryOptions = response;
      });

    },
    /** 查询疾病标签下拉树结构 */
    getTreatRecordTagsTreeselect() {
      getTreatRecordTagsTree(false).then(response => {
        this.tagsOptions = response;
      });
    },
    getDiseaseTreeselect() {
      getTreatCategoryTree('disease',false).then(response => {
        this.diseaseOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.treatOperationList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 检验报告列表操作 */
    handleTreatTest(row){
      this.testListTitle="["+row.name+"]检验报告";
      this.testListVisible=true;
      this.operationForTestListData = Object.assign({}, this.operationForTestListData, {
        treatOperationId: row.id
      });
    },
    /** 手术统计列表操作 */
    handleStat(){
      this.statListTitle="手术统计列表";
      this.statListVisible=true;
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
    /** 关闭表单编辑操作 */
    closeTreatOperationDetail(){
      this.operationVisible = false;
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "添加";
      this.form.treatRecordId = this.queryParams.treatRecordId;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "修改";
      const id = row.id || this.ids.join(",")
      //加载详情
      getTreatOperation(id).then(response => {
        this.form = response;
        this.form.treatRecordId = response.treatRecord.id;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        fee: 0,
        treatDate:getDay(0),
        available:false,
        isSick:true
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      this.open=false;
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTreatOperation(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open=false;
              this.getList();
            });
          } else {
            createTreatOperation(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open=false;
              this.getList();
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
          return deleteTreatOperation(ids);
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
          return exportTreatOperation(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
