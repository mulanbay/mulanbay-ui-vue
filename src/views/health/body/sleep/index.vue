<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="睡眠日期">
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
      <el-form-item label="睡眠时长低于" prop="maxMinutes">
        <el-input-number v-model="queryParams.maxMinutes" :style="{width: '150px'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
        分钟
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:body:sleep:query']">搜索</el-button>
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
          v-hasPermi="['health:body:sleep:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:body:sleep:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:sleep:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['health:body:bodyBasicInfo:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="planStat"
          v-hasPermi="['report:plan:userPlan:commonStat']"
        >计划统计</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sleepList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠日" align="center" width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.sleepDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡觉时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.sleepTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起床时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.getUpTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠总时长" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.totalMinutes<360" style="color: red;">
           {{ formatSleepTimes(row.totalMinutes) }}
          </span>
          <span v-else-if="row.totalMinutes<450" style="color: #9acd32;">
           {{ formatSleepTimes(row.totalMinutes) }}
          </span>
          <span v-else>
           {{ formatSleepTimes(row.totalMinutes) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="浅睡时长" align="center">
        <template slot-scope="{row}">
          <span>{{ formatSleepTimes(row.lightSleep) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="深睡时长" align="center">
        <template slot-scope="{row}">
          <span>{{ formatSleepTimes(row.deepSleep) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠质量" align="center">
        <template slot-scope="{row}">
          <span>{{ row.quality }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:body:sleep:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:sleep:delete']"
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
    <el-dialog :title="title" :visible.sync="open" width="400px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="睡觉时间" prop="sleepTime">
          <el-date-picker type="datetime" v-model="form.sleepTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                    :style="{width: '100%'}" placeholder="请选择时间" clearable >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="起床时间" prop="getUpTime">
          <el-date-picker type="datetime" v-model="form.getUpTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                    :style="{width: '100%'}" placeholder="请选择时间" clearable >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="浅睡时长" prop="lightSleep">
          <el-input-number v-model="form.lightSleep" :style="{width: '80%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
          分钟
        </el-form-item>
        <el-form-item label="深睡时长" prop="deepSleep">
          <el-input-number v-model="form.deepSleep" :style="{width: '80%'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
          分钟
        </el-form-item>
        <el-form-item label="睡眠质量" prop="quality">
          <el-rate
            v-model="form.quality"
            show-score
            :max="10"
            allow-half
            text-color="#ff9900"
            score-template="{value}">
          </el-rate>
        </el-form-item>
        <el-form-item label="备注信息">
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
import {fetchList,getSleep,createSleep,updateSleep,deleteSleep} from "@/api/health/body/sleep";
import {tillNowString} from "@/utils/datetime";
import {dispatchCommonStat} from "@/utils/planUtils";

export default {
  name: "Sleep",
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
      sleepList:[],
      maxMinutesOptions:[],
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
        sleepTime: [
          { required: true, message: "睡觉时间不能为空", trigger: "blur" }
        ],
        getUpTime: [
          { required: true, message: "起床时间不能为空", trigger: "blur" }
        ],
        recordDate: [
          { required: true, message: "采集时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    formatSleepTimes(minutes){
      return tillNowString(minutes*60);
    },
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('Sleep',this.$router);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.sleepList = response.rows;
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
        lightSleep: 0,
        deepSleep: 0,
        quality:6
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
      getSleep(id).then(response => {
        this.form = response;
        this.form.sleepDate=undefined;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSleep(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createSleep(this.form).then(response => {
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
          return deleteSleep(ids);
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
          return exportSleep(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>