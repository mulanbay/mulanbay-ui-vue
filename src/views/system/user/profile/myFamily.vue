<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true">
      <el-form-item label="我的家庭" prop="name">
        <el-input v-model="form.name" placeholder="" />
      </el-form-item>
      <el-form-item v-if="form.id==null">
        <el-button type="primary" icon="el-icon-plus" size="mini" v-hasPermi="['familyGroup:family:create']" @click="handleCreate" >新增</el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button type="success" icon="el-icon-edit" size="mini" v-hasPermi="['familyGroup:family:edit']" @click="handleUpdate" >修改</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" v-hasPermi="['familyGroup:family:dismiss']" @click="handleDismiss" >解散</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-refresh" size="mini" @click="getList" >刷新</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini"  v-hasPermi="['familyGroup:familyUser:invite']" @click="handleInvite" >邀请成员</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table :data="userList"  v-loading="loading"   >
      <el-table-column label="用户编号" prop="key" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="别名" prop="value" align="center">
        <template slot-scope="{row}">
          <span>{{ row.aliasName }}</span>
          <span v-if="row.userId==form.userId">(创建者)</span>
        </template>
      </el-table-column>
      <el-table-column label="管理权限" prop="value" align="center">
        <template slot-scope="{row}">
           <span v-if="row.admin==true"  style="color:green ;">
            <i class="el-icon-success" />
           </span>
           <span v-else style="color:red ;">
            <i class="el-icon-error" />
           </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="value" align="center">
        <template slot-scope="{row}">
          {{ row.statusName }}
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="value" align="center">
        <template slot-scope="{row}">
           <span v-if="row.status=='APPLYING'&&row.userId==myInfo.userId">
            <el-button type="text" icon="el-icon-edit" size="mini" @click="handleJoin(row)" >加入?</el-button>
           </span>
           <span v-else-if="row.status=='SEP_APPLYING'&&myInfo.admin==true">
            <el-button type="text" icon="el-icon-delete" size="mini" @click="handleSeparate(row)" >确认脱离</el-button>
           </span>
           <span v-else-if="row.status=='PASSED'&&row.userId==myInfo.userId&&row.userId!=form.userId">
            <el-button type="text" icon="el-icon-delete" size="mini" @click="handleApplySeparate(row)" >申请脱离</el-button>
           </span>
           <span v-if="row.userId!=form.userId&&myInfo.admin==true">
            <el-button type="text" icon="el-icon-delete" size="mini" @click="handleDelete(row)" >删除</el-button>
           </span>
        </template>
      </el-table-column>
      <el-table-column label="加入时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="家庭名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in commonStatusOptions"
              :key="dict.id"
              :label="dict.id"
            >{{dict.text}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="inviteTitle" :visible.sync="inviteOpen" width="500px" append-to-body>
      <el-form ref="inviteForm" :model="inviteForm" :rules="inviteRules" label-width="120px">
        <el-form-item label="用户名/手机" prop="username">
          <el-input v-model="inviteForm.username" placeholder="用户名/手机" />
        </el-form-item>
        <el-form-item label="成员别名" prop="aliasName">
          <el-input v-model="inviteForm.aliasName" placeholder="成员别名" />
        </el-form-item>
        <el-form-item label="是否管理员" prop="admin">
          <el-radio-group v-model="inviteForm.admin">
            <el-radio
              v-for="dict in booleanOptions"
              :key="dict.id"
              :label="dict.id"
            >{{dict.text}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitInviteForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 加入家庭对话框 -->
    <el-dialog :title="joinTitle" :visible.sync="joinOpen" width="500px" append-to-body>
      <el-form ref="joinForm" :model="joinForm" label-width="120px">
        <el-form-item label="是否加入" prop="join">
          <el-radio-group v-model="joinForm.join">
            <el-radio label="true">加入</el-radio>
            <el-radio label="false">不加入</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitJoinForm">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import {getMyFamily,createFamily,updateFamily,dismissFamily} from "@/api/familyGroup/family";
  import {inviteFamilyUser,joinFamilyUser,applySeparateFamilyUser,separateFamilyUser,deleteFamilyUser} from "@/api/familyGroup/familyUser";

export default {
  data() {
    return {
      loading:false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      booleanOptions:this.booleanOptions,
      form:{},
      userList:[],
      myInfo:{},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      },
      inviteTitle:'',
      inviteOpen:false,
      inviteForm:{
        username:undefined,
        admin:false
      },
      inviteRules: {
        username: [
          { required: true, message: "用户名/手机不能为空", trigger: "blur" }
        ],
        admin: [
          { required: true, message: "是否管理员不能为空", trigger: "blur" }
        ]
      },
      joinTitle:'',
      joinOpen:false,
      joinForm:{
        join:true
      },
    };
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  created() {
    this.getList();
    //console.log(this.familyUserName(this.userId));
  },
  methods: {
    /** 新增 */
    handleCreate(){
      this.title="新增";
      this.open=true;
    },
    /** 修改 */
    handleUpdate(){
      this.title="修改";
      this.open=true;
    },
    /** 删除 */
    handleDelete(){
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateFamily(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
            });
          } else {
            createFamily(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
            });
          }
          this.getList();
        }
      });
    },
    /** 解散 */
    handleDismiss(){
      const id = this.form.id;
      this.$confirm('是否确认要解散该家庭及旗下成员?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return dismissFamily(id);
        }).then(() => {
          this.getList();
          this.form={};
          this.msgSuccess("解散成功");
        }).catch(function() {});
    },
    /** 邀请成员 */
    handleInvite(){
      this.inviteTitle ='邀请成员';
      this.inviteOpen = true;
      this.inviteForm={
        username:undefined,
        aliasName:undefined,
        admin:false,
        familyId:this.form.id
      };
    },
    submitInviteForm(){
      inviteFamilyUser(this.inviteForm).then(response => {
        this.msgSuccess("邀请成功");
        this.inviteOpen = false;
        this.getList();
      });
    },
    /** 加入家庭 */
    handleJoin(row){
      this.joinTitle ='是否加入该家庭';
      this.joinOpen = true;
      this.joinForm={
        id:row.id,
        join:true
      };
    },
    submitJoinForm(){
      joinFamilyUser(this.joinForm).then(response => {
        this.msgSuccess("操作成功");
        this.joinOpen = false;
        this.getList();
      });
    },
    /** 申请脱离 */
    handleApplySeparate(row){
      const para = {id:row.id};
      this.$confirm('是否确认要申请脱离该家庭?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return applySeparateFamilyUser(para);
        }).then(() => {
          this.getList();
          this.msgSuccess("申请成功");
        }).catch(function() {});
    },
    /** 脱离 */
    handleSeparate(row){
      const para = {id:row.id};
      this.$confirm('是否确认"' + row.aliasName + '"脱离家庭?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return separateFamilyUser(para);
        }).then(() => {
          this.getList();
          this.msgSuccess("脱离成功");
        }).catch(function() {});
    },
    /** 删除 */
    handleDelete(row){
      const id = row.id;
      this.$confirm('是否确认要删除"' + row.aliasName + '"该家庭成员?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteFamilyUser(id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 查询列表 */
    getList() {
      this.loading=true;
      getMyFamily().then(response => {
        this.userList = response.userList;
        if(response.family!=null){
          this.form = response.family;
          this.myInfo = response.myInfo;
        }
        this.loading=false;
      });
    }
  }
};
</script>
