<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择类型" prop="commonRecordTypeId">
        <el-select
          v-model="queryParams.commonRecordTypeId"
          placeholder="类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in commonRecordTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="起止日期">
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
      <el-form-item v-if="moreCdn==true" label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['common:commonRecord:query']">搜索</el-button>
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
          v-hasPermi="['common:commonRecord:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['common:commonRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['common:commonRecord:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['common:commonRecord:export']"
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
    <el-table v-loading="loading" :data="commonRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" min-width="120px">
        <template slot-scope="{row}">
          <span>{{ row.commonRecordType.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.value+ row.commonRecordType.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析" width="60">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleAnalyse(row.commonRecordType.id)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地点" align="center" width="160">
        <template slot-scope="{row}">
          <span>{{ row.location }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['common:commonRecord:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['common:commonRecord:delete']"
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
          <el-col :span="24">
            <el-form-item label="类型" prop="commonRecordTypeId">
               <el-select
                 v-model="form.commonRecordTypeId"
                 placeholder="类型"
                 clearable
                 collapse-tags
                 size="medium"
                 style="width: 480px"
                 @change="handleCommonRecordTypeChange"
               >
                 <el-option
                   v-for="dict in commonRecordTypeOptions"
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
            <el-form-item label="名称" prop="name">
              <el-select
                v-model="form.name"
                :style="{width: '100%'}"
                filterable
                allow-create
                default-first-option>
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
            <el-form-item label="时间" prop="occurTime">
              <el-date-picker type="datetime" v-model="form.occurTime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '100%'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="值" prop="value">
             <el-input-number v-model="form.value" :style="{width: '80%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
             <span>{{ valueUnit }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="地点" prop="location">
              <el-input v-model="form.location" placeholder="请输入地点" />
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

  </div>
</template>

<script>
import {fetchList,getCommonRecord,createCommonRecord,updateCommonRecord,deleteCommonRecord,getNameTree} from "@/api/common/commonRecord";
import {getCommonRecordTypeTree,getCommonRecordType } from "@/api/common/commonRecordType";
import {getNowDateTimeString } from "@/utils/datetime";
import {getUserResidentCity } from "@/api/auth/user";
import {dispatchCommonStat} from "@/utils/planUtils";

export default {
  name: "CommonRecord",
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //表单中的单位
      valueUnit:'',
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
      commonRecordList:[],
      //类型
      commonRecordTypeOptions:[],
      nameOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      commonStatusOptions:this.commonStatusOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        commonRecordTypeId: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        value: [
          { required: true, message: "值不能为空", trigger: "blur" }
        ],
        occurTime: [
          { required: true, message: "时间不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getCommonRecordTypeTreeselect();
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
    /** 计划统计 */
    planStat(){
      dispatchCommonStat('CommonRecord',this.$router);
    },
    /** 选择运动类型按钮操作 */
    handleCommonRecordTypeChange() {
      getCommonRecordType(this.form.commonRecordTypeId).then(response => {
        this.valueUnit = response.unit;
        this.form.name = response.name;
      });
      let para ={
        commonRecordTypeId:this.form.commonRecordTypeId
      }
      getNameTree(para).then(response => {
        this.nameOptions = response;
      });
    },
    /** 查询类型下拉树结构 */
    getCommonRecordTypeTreeselect() {
      getCommonRecordTypeTree(false).then(response => {
        this.commonRecordTypeOptions = response;
      });
    },
    //分析
    handleAnalyse(commonRecordTypeId){
      //路由定向
      this.$router.push({name:'CommonRecordAnalyse',query: {commonRecordTypeId:commonRecordTypeId}})
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.commonRecordList = response.rows;
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
        name:undefined,
        location:undefined,
        occurTime:undefined
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
      this.form.occurTime=getNowDateTimeString();
      getUserResidentCity().then(response => {
        this.form.location=response;
      });
      this.open = true;
      this.title = "添加";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getCommonRecord(id).then(response => {
        this.form = response;
        this.form.commonRecordTypeId = response.commonRecordType.id+'';
        this.valueUnit = response.commonRecordType.unit;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateCommonRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createCommonRecord(this.form).then(response => {
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
          return deleteCommonRecord(ids);
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
          return exportCommonRecord(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
