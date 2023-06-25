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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['ai:moduleConfig:query']">搜索</el-button>
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
          v-hasPermi="['ai:moduleConfig:create']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ai:moduleConfig:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ai:moduleConfig:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['ai:moduleConfig:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" fixed="left" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型名称" fixed="left" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型代码" align="center" width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型文件" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.fileName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模型算法" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.algorithmName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.lastModifyTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 'ENABLE'">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-refresh-right"
              @click="handleRevoke(scope.row)"
              v-hasPermi="['ai:moduleConfig:edit']"
            >撤销</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-refresh"
              @click="handleRefresh(scope.row)"
              v-hasPermi="['ai:moduleConfig:edit']"
            >刷新</el-button>
          </span>
          <span v-if="scope.row.status == 'DISABLE'">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-s-promotion"
              @click="handlePublish(scope.row)"
              v-hasPermi="['ai:moduleConfig:edit']"
            >发布</el-button>
          </span>
          <span>
            &nbsp;&nbsp;
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['ai:moduleConfig:delete']"
            >删除</el-button>
          </span>

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
    <el-dialog :title="title" :visible.sync="open" width="650px" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="模型名称" prop="name">
              <el-input v-model="form.name" :style="{width: '100%'}" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模型代码" prop="code">
              <el-input v-model="form.code" :style="{width: '100%'}" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="模型文件" prop="fileName">
              <el-input v-model="form.fileName" :style="{width: '100%'}" placeholder="请输入名称" />
              <el-upload
                class="upload-demo"
                ref="upload"
                accept=".pmml"
                :on-change="fileChange"
                action=""
                :multiple="false"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :auto-upload="false">
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="算法类型" prop="algorithm">
              <el-select
                v-model="form.algorithm"
                placeholder="算法类型"
                clearable
                size="small"
                style="width: 200px"
              >
                <el-option
                  v-for="dict in algorithmOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区分用户" prop="du">
              <el-switch v-model="form.du"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注信息">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <span v-if="formSubmitting == true">
          表单提交中...&nbsp;&nbsp;
        </span>
        <el-button type="primary" @click="submitForm" :disabled="formSubmitting">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import {fetchList,getModuleConfig,createModuleConfig,updateModuleConfig,deleteModuleConfig,publishModuleConfig,refreshModuleConfig,revokeModuleConfig} from "@/api/ai/moduleConfig";

export default {
  name: "ModuleConfig",
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
      dataList:[],
      algorithmOptions:[],
      fileList:[],
      formSubmitting: false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
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
        name: [
          { required: true, message: "模型代码不能为空", trigger: "blur" }
        ],
        code: [
          { required: true, message: "模型代码不能为空", trigger: "blur" }
        ],
        fileName: [
          { required: true, message: "模型文件不能为空", trigger: "blur" }
        ],
        du: [
          { required: true, message: "请选择是否区分用户", trigger: "blur" }
        ],
        algorithm: [
          { required: true, message: "模型算法不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getEnumTree('MLAlgorithm','FIELD',false).then(response => {
      this.algorithmOptions = response;
    });
    this.getList();
  },
  methods: {
    fileChange (file, fileList) {
    	// 这是关键一句
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
      let ff = this.fileList[0]
      this.form.fileName = ff.name;
    },
    /** 删除选择文件 */
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    beforeUpload(file){
      let fileName = file.name;
      alert(fileName);
      let fileExt = fileName.replace(/.+\./, "").toLowerCase();
      if(fileExt!='pmml'){
        this.msgError("文件类型必须为pmml");
      }
      this.form.fileName = fileName;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          this.dataList = response.rows;
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
        code: undefined,
        fileName: undefined,
        du: false,
        algorithm:undefined,
        remark:undefined
      };
      this.resetForm("form");
      this.clearFile();
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
      const id = row.id || this.ids.join(",");
      getModuleConfig(id).then(response => {
        this.form = response;
        this.open = true;
        this.title = "修改";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      let formData = new FormData();
      let files = this.$refs.upload.uploadFiles;
      if(files.length>0){
        this.form.file = files[0].raw;
        formData.append("file", files[0].raw);
      }
      //undefined会以字符传到后端
      formData.append('id', this.form.id==undefined ? '':this.form.id);
      formData.append('name', this.form.name);
      formData.append('code', this.form.code);
      formData.append('fileName', this.form.fileName);
      formData.append('du', this.form.du);
      formData.append('algorithm', this.form.algorithm);
      formData.append('remark', this.form.remark==undefined ? '':this.form.remark);
      this.formSubmitting = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateModuleConfig(formData).then(response => {
              this.formSubmitting = false;;
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            createModuleConfig(formData).then(response => {
              this.formSubmitting = false;;
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 清除上传文件信息 */
    clearFile(){
      if(this.$refs.upload!=null){
        this.$refs.upload.clearFiles()//清空上传列表
      }
      this.fileList = []//集合清空
    },
    /** 获取操作的名称 */
    getHandleTitle(row){
      return row.name + '(code='+row.code+')';
    },
    /** 撤销按钮操作 */
    handleRevoke(row){
      const id = row.id;
      let para ={
        id:id
      }
      let title = this.getHandleTitle(row);
      this.$confirm('是否确认撤销"' + title + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return revokeModuleConfig(para);
        }).then(() => {
          this.getList();
          this.msgSuccess("撤销成功");
        }).catch(function() {});
    },
    /** 发布按钮操作 */
    handlePublish(row){
      const id = row.id;
      let para ={
        id:id
      }
      let title = this.getHandleTitle(row);
      this.$confirm('是否确认发布"' + title + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return publishModuleConfig(para);
        }).then(() => {
          this.getList();
          this.msgSuccess("发布成功");
        }).catch(function() {});
    },
    /** 刷新按钮操作 */
    handleRefresh(row){
      const id = row.id;
      let para ={
        id:id
      }
      let title = this.getHandleTitle(row);
      this.$confirm('是否确认刷新"' + title + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return refreshModuleConfig(para);
        }).then(() => {
          this.getList();
          this.msgSuccess("刷新成功");
        }).catch(function() {});
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteModuleConfig(ids);
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
          return exportRole(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
    }
  }
};
</script>
