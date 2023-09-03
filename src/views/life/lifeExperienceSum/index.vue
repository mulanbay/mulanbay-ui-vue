<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperienceSum:query']">搜索</el-button>
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
          v-hasPermi="['life:lifeExperienceSum:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['life:lifeExperienceSum:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:lifeExperienceSum:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['life:lifeExperienceSum:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleAnalyse"
          v-hasPermi="['life:lifeExperienceSum:analyse']"
        >分析</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="lifeExperienceSumList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年份" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.year }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总天数" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.totalDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作天数" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.workDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="旅行天数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.travelDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学习天数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.studyDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修正" width="100" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleRevise(row)"><i class="el-icon-refresh" /></span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['life:lifeExperienceSum:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:lifeExperienceSum:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="350px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属年份" prop="year">
          <el-input-number v-model="form.year" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        </el-form-item>
        <el-form-item label="总天数" prop="totalDays">
          <el-input-number v-model="form.totalDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        </el-form-item>
        <el-form-item label="工作天数" prop="workDays">
          <el-input-number v-model="form.workDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        </el-form-item>
        <el-form-item label="旅行天数" prop="travelDays">
          <el-input-number v-model="form.travelDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        </el-form-item>
        <el-form-item label="学习天数" prop="studyDays">
          <el-input-number v-model="form.studyDays" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {fetchList,reviseLifeExperienceSum,getLifeExperienceSum,createLifeExperienceSum,updateLifeExperienceSum,deleteLifeExperienceSum} from "@/api/life/lifeExperienceSum";
import {getYear} from "@/utils/datetime";

export default {
  name: "LifeExperienceSum",
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
      // 列表数据
      lifeExperienceSumList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
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
        year: [
          { required: true, message: "年费不能为空", trigger: "blur" }
        ],
        totalDays: [
          { required: true, message: "总天数不能为空", trigger: "blur" }
        ],
        workDays: [
          { required: true, message: "工作天数不能为空", trigger: "blur" }
        ],
        travelDays: [
          { required: true, message: "旅行天数不能为空", trigger: "blur" }
        ],
        studyDays: [
          { required: true, message: "学习天数不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 分析 */
    handleAnalyse(){
      //路由定向
      this.$router.push({name:'LifeExperienceSumAnalyse',query: {}})
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.lifeExperienceSumList = response.rows;
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
        year: getYear(0),
        totalDays: 365,
        workDays: 0,
        travelDays:0,
        studyDays:0
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
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getLifeExperienceSum(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 修正数据操作 */
    handleRevise(row){
      this.$confirm('是否确认要根据当年的公司在职记录、旅行记录修正"' + row.year + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return reviseLifeExperienceSum(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("修正成功");
        }).catch(function() {});
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateLifeExperienceSum(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createLifeExperienceSum(this.form).then(response => {
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
          return deleteLifeExperienceSum(ids);
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
          return exportLifeExperienceSum(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
