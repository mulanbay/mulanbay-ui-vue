<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="采集日期">
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
      <el-form-item v-if="moreCdn==true" label="体重区间">
          <el-input-number v-model="queryParams.startWeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.endWeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="身高区间">
          <el-input-number v-model="queryParams.startHeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.endHeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:body:bodyBasicInfo:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
          v-hasPermi="['health:body:bodyBasicInfo:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['health:body:bodyBasicInfo:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:bodyBasicInfo:delete']"
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
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="bodyBasicInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="体重(公斤)" align="center" width="95">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.weight }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身高(厘米)" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.height }}</span>
        </template>
      </el-table-column>
      <el-table-column label="BMI指数" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.bmi<=18.4" style="color: #bc8f8f;">
           {{ row.bmi }}(偏瘦)
          </span>
          <span v-else-if="row.bmi>=18.5&&row.bmi<=23.9" style="color: green;">
           {{ row.bmi }}(正常)
          </span>
          <span v-else-if="row.bmi>=24&&row.bmi<=27.9" style="color: yellow;">
           {{ row.bmi }}(过重)
          </span>
          <span v-else style="color: red;">
           {{ row.bmi }}(肥胖)
          </span>
        </template>
      </el-table-column>
      <el-table-column label="时辰" align="center" >
        <template slot-scope="{row}">
          <span>{{ getHourInfo(row.recordDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采集时间" align="center" min-width="180px">
        <template slot-scope="{row}">
          <span>{{ row.recordDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['health:body:bodyBasicInfo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:bodyBasicInfo:delete']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="身高(厘米)" prop="height">
          <el-input-number v-model="form.height" :style="{width: '200px'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
        </el-form-item>
        <el-form-item label="体重(公斤)" prop="weight">
          <el-input-number v-model="form.weight" :style="{width: '200px'}" controls-position="right" :min="0" :controls="true" :precision="1"/>
        </el-form-item>
        <el-form-item label="采集时间" prop="recordDate">
          <el-date-picker type="datetime" v-model="form.recordDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                    :style="{width: '200px'}" placeholder="请选择时间" clearable >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="form.remark" :style="{width: '200px'}" type="textarea" placeholder="请输入内容"></el-input>
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
import {fetchList,getBodyBasicInfo,createBodyBasicInfo,updateBodyBasicInfo,deleteBodyBasicInfo} from "@/api/health/body/bodyBasicInfo";
import {getHourDesc} from "@/utils/datetime";

export default {
  name: "BodyBasicInfo",
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
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
      bodyBasicInfoList:[],
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
        height: [
          { required: true, message: "身高不能为空", trigger: "blur" }
        ],
        weight: [
          { required: true, message: "体重不能为空", trigger: "blur" }
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
    /** 时辰信息 */
    getHourInfo(recordDate) {
      return getHourDesc(recordDate);
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.bodyBasicInfoList = response.rows;
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
        height: undefined,
        weight: undefined,
        recordDate:undefined
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
      getBodyBasicInfo(id).then(response => {
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
            updateBodyBasicInfo(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createBodyBasicInfo(this.form).then(response => {
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
          return deleteBodyBasicInfo(ids);
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
          return exportBodyBasicInfo(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
