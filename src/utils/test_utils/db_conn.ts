import { Provider } from "@nestjs/common";
import { PostgreSqlContainer,StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { DATA_SOURCE } from "../../entity_provider/constant";
import { DataSource } from "typeorm";
import { UserAccount } from "../../entities/user_account.entity";
import { UserWallet } from "../../entities/user_wallet.entity";
import { WalletBalance } from "../../entities/wallet_balance";
import { Token } from "../../entities/token.entity";

export const getDbContainer = async () => {
let container: StartedPostgreSqlContainer
     container = await new PostgreSqlContainer().withDatabase("test").withPassword("test").withUsername("test").start();
    return container
}

export const GetDatabaseSourceProvider = (container: StartedPostgreSqlContainer) => ({
    provide: DATA_SOURCE,
    useFactory: async () => {
        // const db_container = await getDbContainer()
        const host = container.getHost()
        const port = container.getPort()
        const username = container.getUsername()
        const password = container.getPassword()
        const db_name = container.getDatabase()
        const dataSource = new DataSource({
            type: "mysql",
            host,
            port,
            username,
            password,
            database: db_name,
            entities: [UserAccount,UserWallet,WalletBalance,Token
            ],
            synchronize: true,
        });

        return dataSource.initialize();
    },
})

export const teardownMySqlContainer = async (container: StartedPostgreSqlContainer) => {
    await container.stop();
}