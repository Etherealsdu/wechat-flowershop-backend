# 微信花店后台系统 - 数据备份与应急容灾恢复指南

## 目录

1. [备份策略](#备份策略)
2. [数据库备份](#数据库备份)
3. [文件备份](#文件备份)
4. [自动化备份脚本](#自动化备份脚本)
5. [数据恢复](#数据恢复)
6. [容灾方案](#容灾方案)
7. [应急响应流程](#应急响应流程)
8. [灾难恢复演练](#灾难恢复演练)

---

## 备份策略

### 备份原则：3-2-1 规则

- **3** 份备份副本
- **2** 种不同存储介质
- **1** 份异地备份

### 备份类型

| 类型 | 频率 | 保留时间 | 说明 |
|------|------|----------|------|
| 全量备份 | 每周日 | 30天 | 完整数据库备份 |
| 增量备份 | 每天 | 7天 | 仅备份变化数据 |
| 二进制日志 | 实时 | 7天 | MySQL binlog |
| 配置备份 | 每周 | 90天 | 系统配置文件 |

### 备份时间窗口

- 全量备份：每周日 02:00-04:00
- 增量备份：每天 02:00-02:30
- 二进制日志：实时同步

---

## 数据库备份

### MySQL 全量备份

```bash
#!/bin/bash
# /home/user/scripts/mysql_full_backup.sh

BACKUP_DIR="/data/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="wechat_flowershop"
DB_USER="backup_user"
DB_PASS="backup_password"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 执行备份
mysqldump -u${DB_USER} -p${DB_PASS} \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --complete-insert \
    --hex-blob \
    ${DB_NAME} | gzip > ${BACKUP_DIR}/${DB_NAME}_full_${DATE}.sql.gz

# 验证备份
if [ $? -eq 0 ]; then
    echo "$(date): Full backup completed successfully" >> ${BACKUP_DIR}/backup.log

    # 计算MD5校验和
    md5sum ${BACKUP_DIR}/${DB_NAME}_full_${DATE}.sql.gz > ${BACKUP_DIR}/${DB_NAME}_full_${DATE}.md5
else
    echo "$(date): Full backup FAILED!" >> ${BACKUP_DIR}/backup.log
    # 发送告警
    /home/user/scripts/send_alert.sh "MySQL full backup failed!"
    exit 1
fi

# 清理过期备份
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "*.md5" -mtime +${RETENTION_DAYS} -delete

echo "$(date): Old backups cleaned up" >> ${BACKUP_DIR}/backup.log
```

### MySQL 增量备份（基于binlog）

```bash
#!/bin/bash
# /home/user/scripts/mysql_incremental_backup.sh

BACKUP_DIR="/data/backup/mysql/binlog"
DATE=$(date +%Y%m%d_%H%M%S)
BINLOG_DIR="/var/lib/mysql"

# 创建备份目录
mkdir -p ${BACKUP_DIR}/${DATE}

# 刷新日志并获取当前binlog位置
mysql -e "FLUSH LOGS; SHOW MASTER STATUS\G" > ${BACKUP_DIR}/${DATE}/position.txt

# 复制binlog文件
cp ${BINLOG_DIR}/mysql-bin.* ${BACKUP_DIR}/${DATE}/

# 压缩备份
tar -czf ${BACKUP_DIR}/binlog_${DATE}.tar.gz -C ${BACKUP_DIR}/${DATE} .
rm -rf ${BACKUP_DIR}/${DATE}

echo "$(date): Incremental backup completed" >> ${BACKUP_DIR}/backup.log
```

### 使用 XtraBackup 热备份

```bash
#!/bin/bash
# /home/user/scripts/xtrabackup_full.sh

BACKUP_DIR="/data/backup/xtrabackup"
DATE=$(date +%Y%m%d_%H%M%S)

# 全量热备份
xtrabackup --backup \
    --target-dir=${BACKUP_DIR}/${DATE} \
    --user=backup_user \
    --password=backup_password

# 准备备份（使其可恢复）
xtrabackup --prepare --target-dir=${BACKUP_DIR}/${DATE}

# 压缩备份
tar -czf ${BACKUP_DIR}/full_backup_${DATE}.tar.gz -C ${BACKUP_DIR}/${DATE} .
rm -rf ${BACKUP_DIR}/${DATE}

echo "$(date): XtraBackup completed" >> ${BACKUP_DIR}/backup.log
```

---

## 文件备份

### 应用代码和配置备份

```bash
#!/bin/bash
# /home/user/scripts/app_backup.sh

BACKUP_DIR="/data/backup/app"
APP_DIR="/home/user/wechat-flowershop-backend"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p ${BACKUP_DIR}

# 备份应用代码（排除node_modules）
tar -czf ${BACKUP_DIR}/app_${DATE}.tar.gz \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='coverage' \
    -C $(dirname ${APP_DIR}) $(basename ${APP_DIR})

# 备份环境配置
cp ${APP_DIR}/backend/.env ${BACKUP_DIR}/env_${DATE}.backup

echo "$(date): App backup completed" >> ${BACKUP_DIR}/backup.log
```

### OSS 文件同步备份

```bash
#!/bin/bash
# /home/user/scripts/oss_backup.sh

# 使用ossutil同步文件到备份桶
ossutil sync \
    oss://primary-bucket/uploads/ \
    oss://backup-bucket/uploads/ \
    --update \
    --delete

echo "$(date): OSS sync completed" >> /var/log/oss_backup.log
```

---

## 自动化备份脚本

### 主备份脚本

```bash
#!/bin/bash
# /home/user/scripts/backup_all.sh

LOG_FILE="/var/log/backup_all.log"
ALERT_EMAIL="admin@flowershop.com"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> ${LOG_FILE}
}

send_alert() {
    echo "$1" | mail -s "Backup Alert - FlowerShop" ${ALERT_EMAIL}
    /home/user/scripts/send_dingtalk_alert.sh "$1"
}

log "Starting backup process..."

# 1. MySQL全量备份
log "Starting MySQL full backup..."
if /home/user/scripts/mysql_full_backup.sh; then
    log "MySQL full backup: SUCCESS"
else
    log "MySQL full backup: FAILED"
    send_alert "MySQL full backup failed!"
fi

# 2. 应用代码备份
log "Starting app backup..."
if /home/user/scripts/app_backup.sh; then
    log "App backup: SUCCESS"
else
    log "App backup: FAILED"
    send_alert "App backup failed!"
fi

# 3. 同步到远程存储
log "Starting remote sync..."
if /home/user/scripts/sync_to_remote.sh; then
    log "Remote sync: SUCCESS"
else
    log "Remote sync: FAILED"
    send_alert "Remote sync failed!"
fi

log "Backup process completed"
```

### Crontab 配置

```bash
# 每天凌晨2点执行增量备份
0 2 * * * /home/user/scripts/mysql_incremental_backup.sh

# 每周日凌晨3点执行全量备份
0 3 * * 0 /home/user/scripts/backup_all.sh

# 每6小时同步一次OSS
0 */6 * * * /home/user/scripts/oss_backup.sh

# 每天凌晨4点验证备份
0 4 * * * /home/user/scripts/verify_backup.sh
```

### 备份验证脚本

```bash
#!/bin/bash
# /home/user/scripts/verify_backup.sh

BACKUP_DIR="/data/backup/mysql"
VERIFY_DIR="/tmp/backup_verify"
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/*.sql.gz | head -1)

mkdir -p ${VERIFY_DIR}

# 解压并检查备份文件
gunzip -c ${LATEST_BACKUP} > ${VERIFY_DIR}/test.sql

# 检查SQL文件完整性
if grep -q "-- Dump completed" ${VERIFY_DIR}/test.sql; then
    echo "$(date): Backup verification: SUCCESS" >> ${BACKUP_DIR}/verify.log
else
    echo "$(date): Backup verification: FAILED" >> ${BACKUP_DIR}/verify.log
    /home/user/scripts/send_alert.sh "Backup verification failed!"
fi

rm -rf ${VERIFY_DIR}
```

---

## 数据恢复

### MySQL 全量恢复

```bash
#!/bin/bash
# /home/user/scripts/mysql_restore.sh

BACKUP_FILE=$1
DB_NAME="wechat_flowershop"
DB_USER="root"
DB_PASS="your_password"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

echo "WARNING: This will overwrite the current database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# 停止应用
pm2 stop flowershop-backend

# 恢复数据库
echo "Restoring database from ${BACKUP_FILE}..."
gunzip -c ${BACKUP_FILE} | mysql -u${DB_USER} -p${DB_PASS} ${DB_NAME}

if [ $? -eq 0 ]; then
    echo "Database restored successfully!"
else
    echo "Database restore FAILED!"
    exit 1
fi

# 启动应用
pm2 start flowershop-backend

echo "Restore completed!"
```

### 基于时间点的恢复（PITR）

```bash
#!/bin/bash
# /home/user/scripts/mysql_pitr_restore.sh

FULL_BACKUP=$1
TARGET_TIME=$2  # 格式: "2024-02-04 10:30:00"
BINLOG_DIR="/data/backup/mysql/binlog"

if [ -z "$FULL_BACKUP" ] || [ -z "$TARGET_TIME" ]; then
    echo "Usage: $0 <full_backup.sql.gz> <target_time>"
    echo "Example: $0 backup.sql.gz '2024-02-04 10:30:00'"
    exit 1
fi

# 1. 恢复全量备份
echo "Step 1: Restoring full backup..."
gunzip -c ${FULL_BACKUP} | mysql -uroot -p wechat_flowershop

# 2. 应用binlog到指定时间点
echo "Step 2: Applying binlog until ${TARGET_TIME}..."
mysqlbinlog --stop-datetime="${TARGET_TIME}" ${BINLOG_DIR}/*.sql | mysql -uroot -p

echo "PITR restore completed!"
```

### XtraBackup 恢复

```bash
#!/bin/bash
# /home/user/scripts/xtrabackup_restore.sh

BACKUP_FILE=$1
DATA_DIR="/var/lib/mysql"

# 停止MySQL
sudo systemctl stop mysql

# 清空数据目录
sudo rm -rf ${DATA_DIR}/*

# 解压备份
tar -xzf ${BACKUP_FILE} -C ${DATA_DIR}

# 设置权限
sudo chown -R mysql:mysql ${DATA_DIR}

# 启动MySQL
sudo systemctl start mysql

echo "XtraBackup restore completed!"
```

---

## 容灾方案

### 架构图

```
主数据中心 (北京)                 灾备数据中心 (上海)
┌─────────────────┐             ┌─────────────────┐
│   Load Balancer │             │   Load Balancer │
└────────┬────────┘             └────────┬────────┘
         │                               │
┌────────┴────────┐             ┌────────┴────────┐
│   App Cluster   │             │   App Cluster   │
│   (3 nodes)     │             │   (2 nodes)     │
└────────┬────────┘             └────────┬────────┘
         │                               │
┌────────┴────────┐             ┌────────┴────────┐
│   MySQL Master  │──Replication→   MySQL Slave   │
└────────┬────────┘             └─────────────────┘
         │
┌────────┴────────┐
│   MySQL Slave   │
└─────────────────┘
```

### MySQL 主从复制配置

#### 主库配置 (my.cnf)

```ini
[mysqld]
server-id = 1
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7
sync_binlog = 1
gtid_mode = ON
enforce_gtid_consistency = ON
```

#### 从库配置 (my.cnf)

```ini
[mysqld]
server-id = 2
relay_log = relay-bin
read_only = 1
gtid_mode = ON
enforce_gtid_consistency = ON
```

#### 配置主从复制

```sql
-- 在主库创建复制用户
CREATE USER 'replication'@'%' IDENTIFIED BY 'replication_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';
FLUSH PRIVILEGES;

-- 在从库配置主库连接
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='replication',
    MASTER_PASSWORD='replication_password',
    MASTER_AUTO_POSITION=1;

START SLAVE;

-- 检查复制状态
SHOW SLAVE STATUS\G
```

### 主从切换流程

```bash
#!/bin/bash
# /home/user/scripts/failover.sh

MASTER_IP="192.168.1.10"
SLAVE_IP="192.168.1.11"
VIP="192.168.1.100"

echo "Starting failover process..."

# 1. 检查主库状态
if ! mysql -h${MASTER_IP} -e "SELECT 1" > /dev/null 2>&1; then
    echo "Master is down, starting failover..."

    # 2. 将从库提升为主库
    mysql -h${SLAVE_IP} -e "STOP SLAVE; RESET SLAVE ALL;"
    mysql -h${SLAVE_IP} -e "SET GLOBAL read_only = 0;"

    # 3. 更新VIP
    ssh ${SLAVE_IP} "ip addr add ${VIP}/24 dev eth0"

    # 4. 更新应用配置
    sed -i "s/DB_HOST=.*/DB_HOST=${SLAVE_IP}/" /home/user/wechat-flowershop-backend/backend/.env

    # 5. 重启应用
    pm2 restart flowershop-backend

    echo "Failover completed! New master: ${SLAVE_IP}"

    # 6. 发送告警
    /home/user/scripts/send_alert.sh "Database failover completed. New master: ${SLAVE_IP}"
else
    echo "Master is running normally."
fi
```

---

## 应急响应流程

### 应急响应级别

| 级别 | 描述 | 响应时间 | 示例 |
|------|------|----------|------|
| P1 | 系统完全不可用 | 15分钟 | 数据库宕机 |
| P2 | 核心功能受损 | 30分钟 | 支付功能异常 |
| P3 | 非核心功能异常 | 2小时 | 图片上传失败 |
| P4 | 轻微问题 | 24小时 | 日志记录异常 |

### P1 事故响应流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      P1 事故响应流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 确认事故 (5分钟)                                            │
│     ├── 收到告警                                               │
│     ├── 确认影响范围                                           │
│     └── 通知相关人员                                           │
│                                                                 │
│  2. 初步诊断 (10分钟)                                           │
│     ├── 检查服务状态                                           │
│     ├── 查看错误日志                                           │
│     └── 确定故障原因                                           │
│                                                                 │
│  3. 紧急恢复 (30分钟)                                           │
│     ├── 尝试重启服务                                           │
│     ├── 如失败，执行failover                                   │
│     └── 如需要，恢复备份                                       │
│                                                                 │
│  4. 验证恢复 (15分钟)                                           │
│     ├── 检查核心功能                                           │
│     ├── 检查数据一致性                                         │
│     └── 通知业务方确认                                         │
│                                                                 │
│  5. 事后总结 (24小时内)                                         │
│     ├── 编写事故报告                                           │
│     ├── 根因分析                                               │
│     └── 改进措施                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 应急恢复检查清单

```markdown
## P1 事故恢复检查清单

### 1. 确认事故
- [ ] 确认告警来源
- [ ] 确认影响范围（用户数、功能）
- [ ] 通知值班人员
- [ ] 建立应急沟通群

### 2. 初步诊断
- [ ] 检查服务器可达性
- [ ] 检查 PM2 进程状态
- [ ] 检查 MySQL 连接
- [ ] 检查 Redis 连接
- [ ] 查看最近的错误日志

### 3. 执行恢复
- [ ] 尝试重启应用服务
- [ ] 如数据库故障，执行主从切换
- [ ] 如数据损坏，从备份恢复
- [ ] 更新 DNS/负载均衡配置

### 4. 验证恢复
- [ ] API 健康检查通过
- [ ] 核心功能测试通过
- [ ] 数据一致性检查
- [ ] 业务方确认正常

### 5. 事后处理
- [ ] 记录事故时间线
- [ ] 统计业务影响
- [ ] 编写事故报告
- [ ] 制定改进措施
```

---

## 灾难恢复演练

### 演练计划

| 类型 | 频率 | 内容 |
|------|------|------|
| 备份恢复演练 | 每月 | 验证备份可恢复性 |
| 主从切换演练 | 每季度 | 验证failover流程 |
| 完整灾难恢复 | 每半年 | 模拟数据中心故障 |

### 演练脚本

```bash
#!/bin/bash
# /home/user/scripts/dr_drill.sh

echo "=== 灾难恢复演练开始 ==="
echo "时间: $(date)"

# 1. 备份恢复演练
echo "Step 1: 备份恢复测试"
LATEST_BACKUP=$(ls -t /data/backup/mysql/*.sql.gz | head -1)
echo "使用备份: ${LATEST_BACKUP}"

# 创建测试数据库
mysql -e "CREATE DATABASE IF NOT EXISTS dr_test"
gunzip -c ${LATEST_BACKUP} | mysql dr_test

if [ $? -eq 0 ]; then
    echo "✅ 备份恢复测试通过"
    mysql -e "DROP DATABASE dr_test"
else
    echo "❌ 备份恢复测试失败"
fi

# 2. 主从复制检查
echo "Step 2: 主从复制检查"
SLAVE_STATUS=$(mysql -h slave_ip -e "SHOW SLAVE STATUS\G" | grep "Seconds_Behind_Master")
echo "复制延迟: ${SLAVE_STATUS}"

# 3. 应用启动测试
echo "Step 3: 应用启动测试"
pm2 restart flowershop-backend
sleep 10
HEALTH_CHECK=$(curl -s http://localhost:3000)
if echo ${HEALTH_CHECK} | grep -q "WeChat Flower Shop"; then
    echo "✅ 应用启动测试通过"
else
    echo "❌ 应用启动测试失败"
fi

echo "=== 灾难恢复演练结束 ==="
```

### 演练报告模板

```markdown
# 灾难恢复演练报告

## 基本信息
- 演练时间: YYYY-MM-DD HH:mm - HH:mm
- 参与人员:
- 演练类型: 备份恢复 / 主从切换 / 完整DR

## 演练结果

| 项目 | 预期时间 | 实际时间 | 结果 |
|------|----------|----------|------|
| 备份恢复 | 30分钟 | XX分钟 | ✅/❌ |
| 主从切换 | 5分钟 | XX分钟 | ✅/❌ |
| 应用重启 | 2分钟 | XX分钟 | ✅/❌ |
| 功能验证 | 10分钟 | XX分钟 | ✅/❌ |

## 发现的问题
1.
2.

## 改进措施
1.
2.

## 下次演练计划
- 时间: YYYY-MM-DD
- 类型:
```

---

## RTO/RPO 目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| RTO (恢复时间目标) | < 1小时 | 系统恢复可用的最大时间 |
| RPO (恢复点目标) | < 1小时 | 可接受的最大数据丢失时间 |

### 达成方案

1. **RTO < 1小时**
   - 热备环境随时可用
   - 自动化failover脚本
   - 预配置的恢复流程

2. **RPO < 1小时**
   - 实时binlog复制
   - 每小时增量备份
   - OSS 异步同步
