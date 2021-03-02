<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
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
      <el-form-item label="日期">
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
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormalRecord:query']">搜索</el-button>
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
          v-hasPermi="['health:body:bodyAbnormalRecord:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:body:bodyAbnormalRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:bodyAbnormalRecord:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:body:bodyAbnormalRecord:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="bodyAbnormalRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.disease }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.disease,'DISEASE')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="器官" align="center">
        <template slot-scope="{row}">
          <span>{{ row.organ }}</span>
          <span class="link-type" @click="showBodyAbnormalRecordAnalyse(row.organ,'ORGAN')"><i class="el-icon-s-promotion" /></span>
        </template>
      </el-table-column>
      <el-table-column label="用药记录" width="80" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDrugDetailList(row)"><i class="el-icon-s-grid" /></span>
        </template>
      </el-table-column>
      <el-table-column label="发生日期" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.occurDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.finishDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="持续天数" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.lastDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疼痛级别" align="center">
        <template slot-scope="{row}">
          <el-rate
            v-model="row.painLevel"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}">
          </el-rate>
        </template>
      </el-table-column>
      <el-table-column label="重要等级" align="center" >
        <template slot-scope="{row}">
          <el-rate
            v-model="row.importantLevel"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}">
          </el-rate>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:body:bodyAbnormalRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:bodyAbnormalRecord:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="疾病名称" prop="disease">
              <el-select
                v-model="form.disease"
                :style="{width: '100%'}"
                filterable
                allow-create
                default-first-option>
                <el-option
                  v-for="dict in diseaseOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="器官名称" prop="organ">
              <el-select
                v-model="form.organ"
                :style="{width: '100%'}"
                filterable
                allow-create
                default-first-option>
                <el-option
                  v-for="dict in organOptions"
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
            <el-form-item label="疼痛等级" prop="painLevel">
             <el-rate
               v-model="form.painLevel"
               show-score
               text-color="#ff9900"
               score-template="{value}">
             </el-rate>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重要程度" prop="importantLevel">
             <el-rate
               v-model="form.importantLevel"
               show-score
               allow-half
               text-color="#ff9900"
               score-template="{value}">
             </el-rate>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发生日期" prop="occurDate">
              <el-date-picker type="date" v-model="form.occurDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="finishDate">
              <el-date-picker type="date" v-model="form.finishDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable @change="calculateMinutes">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="持续天数" prop="lastDays">
             <el-input-number v-model="form.lastDays" :style="{width: '100%'}" placeholder="单位:天" controls-position="right" :min="1" :controls="false" :precision="0" />
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用药统计页面 -->
    <el-dialog :title="drugDetailStatTitle" width="900px" :visible.sync="drugDetailStatVisible" append-to-body customClass="customDialogCss">
      <treat-drug-detail-stat :treatData="treatData"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,getAbnormalCategoryTree,getBodyAbnormalRecord,createBodyAbnormalRecord,updateBodyAbnormalRecord,deleteBodyAbnormalRecord} from "@/api/health/body/bodyAbnormalRecord";
  import {dateDiff} from "@/utils/datetime";
  import TreatDrugDetailStat from '../../treat/treatDrugDetail/stat'

export default {
  name: "BodyAbnormalRecord",
  components: {
    'treat-drug-detail-stat':TreatDrugDetailStat
  },
  data() {
    return {
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
      // 数据列表
      bodyAbnormalRecordList:[],
      diseaseOptions:[],
      organOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //用药详情统计页面 start
      drugDetailStatTitle:'',
      drugDetailStatVisible:false,
      treatData:{},
      //用药详情统计页面 end
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        disease: [
          { required: true, message: "疾病不能为空", trigger: "blur" }
        ],
        organ: [
          { required: true, message: "器官不能为空", trigger: "blur" }
        ],
        occurDate: [
          { required: true, message: "发生日期不能为空", trigger: "blur" }
        ],
        finishDate: [
          { required: true, message: "结束日期不能为空", trigger: "blur" }
        ],
        lastDays: [
          { required: true, message: "持续天数不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 初始化下拉树结构 */
    initOptionList(){
      getAbnormalCategoryTree('disease',false).then(response => {
        this.diseaseOptions = response;
      });
      getAbnormalCategoryTree('organ',false).then(response => {
        this.organOptions = response;
      });
    },
    //计算时长
    calculateMinutes(){
      let occurDate=this.form.occurDate;
      let finishDate =this.form.finishDate;
      let days = dateDiff(occurDate,finishDate)+1;
      this.form.lastDays=days;
    },
    /** 身体不适分析 */
    showBodyAbnormalRecordAnalyse(name,groupField){
      //路由定向
      this.$router.push({name:'BodyAbnormalRecord/analyse',query: {name:name,groupField:groupField}})
    },
    /** 用药记录 */
    handleDrugDetailList(row){
      this.drugDetailStatTitle="["+row.disease+"]用药统计",
      this.drugDetailStatVisible = true;
      this.treatData = Object.assign({}, this.treatData, {
        startDate: row.occurDate,
        endDate:row.finishDate,
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.bodyAbnormalRecordList = response.rows;
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
        painLevel: 3,
        importantLevel: 3
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
      this.reset();
      this.initOptionList();
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.initOptionList();
      const id = row.id || this.ids.join(",")
      getBodyAbnormalRecord(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateBodyAbnormalRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createBodyAbnormalRecord(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
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
          return deleteBodyAbnormalRecord(ids);
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
          return exportBodyAbnormalRecord(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
