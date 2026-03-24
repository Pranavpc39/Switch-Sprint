export const javaRevisionPlan = {
  1: {
    title: "Collections Core",
    concepts: ["List vs Set vs Map", "ArrayList vs LinkedList", "HashMap internals basics"],
    questions: [
      "When would you choose List, Set, and Map in real code?",
      "What is the difference between ArrayList and LinkedList in terms of access and insertion?",
      "How does HashMap store data internally?",
      "Why does HashMap usually give near O(1) lookup time?",
      "What happens when two keys have the same hash?"
    ]
  },
  2: {
    title: "OOP And SOLID",
    concepts: ["Abstraction", "Encapsulation", "Inheritance vs composition", "SOLID principles"],
    questions: [
      "Explain the four pillars of OOP with simple Java examples.",
      "When is composition better than inheritance?",
      "What does each SOLID principle mean?",
      "Which SOLID principles appear most often in Spring applications?",
      "Give one bad design example and improve it using SOLID."
    ]
  },
  3: {
    title: "Exceptions And Equality",
    concepts: ["Checked vs unchecked exceptions", "equals and hashCode contract"],
    questions: [
      "What is the difference between checked and unchecked exceptions?",
      "When should you create a custom exception?",
      "Why must equals and hashCode be consistent?",
      "What goes wrong in HashSet or HashMap if hashCode is wrong?",
      "How would you implement equals and hashCode in an entity class?"
    ]
  },
  4: {
    title: "Spring Boot Basics",
    concepts: ["Dependency injection", "Common Spring annotations", "Bean management"],
    questions: [
      "What is dependency injection and why is it useful?",
      "What is the difference between @Component, @Service, @Repository, and @Controller?",
      "How does Spring create and manage beans?",
      "What is constructor injection and why is it preferred?",
      "What happens during application startup in Spring Boot?"
    ]
  },
  5: {
    title: "Java 8 Streams",
    concepts: ["Streams vs collections", "map/filter/reduce", "Intermediate vs terminal operations"],
    questions: [
      "How are streams different from collections?",
      "Explain map, filter, and reduce with a practical example.",
      "What are intermediate and terminal operations?",
      "What is lazy evaluation in streams?",
      "When should you avoid streams and use normal loops?"
    ]
  },
  6: {
    title: "REST Flow",
    concepts: ["Controller-service-repository flow", "REST request lifecycle", "DTO usage"],
    questions: [
      "How does a REST request flow through a Spring Boot application?",
      "Why do we keep controller, service, and repository layers separate?",
      "What is a DTO and why use it instead of exposing entities directly?",
      "What HTTP methods are commonly used and when?",
      "How would you handle validation for a request body?"
    ]
  },
  7: {
    title: "JPA And Hibernate Basics",
    concepts: ["ORM", "Entity lifecycle", "JPA vs Hibernate"],
    questions: [
      "What problem does JPA solve?",
      "What is the difference between JPA and Hibernate?",
      "What is an entity in JPA?",
      "What are the common entity lifecycle states?",
      "When would Hibernate generate more queries than expected?"
    ]
  },
  8: {
    title: "Collections Deep Dive",
    concepts: ["HashMap vs TreeMap", "HashSet vs LinkedHashSet", "Comparable vs Comparator"],
    questions: [
      "What is the difference between HashMap and TreeMap?",
      "When would you use LinkedHashSet instead of HashSet?",
      "What is the difference between Comparable and Comparator?",
      "How does TreeMap keep keys sorted?",
      "What are fail-fast iterators?"
    ]
  },
  9: {
    title: "Spring Request Lifecycle",
    concepts: ["DispatcherServlet", "Request mapping", "Exception handling"],
    questions: [
      "What is DispatcherServlet?",
      "How does Spring decide which controller method to call?",
      "How are request parameters and JSON bodies mapped to Java objects?",
      "How would you handle global exceptions in Spring Boot?",
      "Where does validation fit into the request lifecycle?"
    ]
  },
  10: {
    title: "Multithreading Basics",
    concepts: ["Thread vs process", "Runnable vs Callable", "Synchronization"],
    questions: [
      "What is the difference between a process and a thread?",
      "What is the difference between Runnable and Callable?",
      "Why do race conditions happen?",
      "What does synchronized do?",
      "What are deadlock and starvation?"
    ]
  },
  11: {
    title: "SQL Fundamentals",
    concepts: ["Joins", "Indexes", "Normalization"],
    questions: [
      "What is the difference between INNER JOIN and LEFT JOIN?",
      "What is an index and why does it improve performance?",
      "When can too many indexes hurt performance?",
      "What is normalization and why is it useful?",
      "How would you debug a slow SQL query?"
    ]
  },
  12: {
    title: "JPA Relationships",
    concepts: ["OneToOne", "OneToMany", "ManyToOne", "Lazy vs eager loading"],
    questions: [
      "How do OneToOne, OneToMany, and ManyToOne relationships work in JPA?",
      "What is the difference between lazy and eager loading?",
      "Why does lazy loading often lead to N+1 issues?",
      "What is cascading in JPA?",
      "What is mappedBy and why is it needed?"
    ]
  },
  14: {
    title: "Spring Boot Interview Revision",
    concepts: ["Profiles", "Configuration", "Actuator basics"],
    questions: [
      "What is Spring Boot and how is it different from Spring?",
      "What are profiles in Spring Boot?",
      "How does Spring Boot auto-configuration work at a high level?",
      "What is the purpose of application.properties or application.yml?",
      "What is Actuator and why is it useful?"
    ]
  },
  15: {
    title: "Executor Framework",
    concepts: ["Thread pools", "ExecutorService", "Future basics"],
    questions: [
      "Why is ExecutorService preferred over creating threads manually?",
      "What is a thread pool?",
      "What is the difference between submit and execute?",
      "What is a Future?",
      "When should you shut down an executor?"
    ]
  },
  16: {
    title: "Spring Security Basics",
    concepts: ["Authentication vs authorization", "Filters", "JWT basics"],
    questions: [
      "What is the difference between authentication and authorization?",
      "How does Spring Security fit into the request flow?",
      "What is a filter in Spring Security?",
      "What is JWT at a high level?",
      "Where would you store roles and permissions?"
    ]
  },
  17: {
    title: "Transactions And ACID",
    concepts: ["ACID properties", "Transaction boundaries", "Rollback basics"],
    questions: [
      "What are the ACID properties?",
      "Why are transactions important in backend systems?",
      "What does @Transactional do?",
      "When does Spring roll back a transaction?",
      "What can go wrong if transaction boundaries are too large?"
    ]
  },
  20: {
    title: "Java Oral Round",
    concepts: ["Rapid revision", "Project explanation", "Core Java answers"],
    questions: [
      "Explain HashMap, ArrayList, and String immutability in simple words.",
      "Explain dependency injection and bean scope in Spring.",
      "Explain one project end-to-end in 3 to 5 minutes.",
      "Explain one concurrency problem you know and how to avoid it.",
      "Explain one DB optimization or API design decision from your project."
    ]
  },
  22: {
    title: "Top Java Questions",
    concepts: ["Strings", "Collections", "JVM basics", "Immutability"],
    questions: [
      "Why is String immutable in Java?",
      "What is the difference between String, StringBuilder, and StringBuffer?",
      "What is the difference between HashMap and ConcurrentHashMap?",
      "What is autoboxing and unboxing?",
      "What is the difference between == and equals in Java?"
    ]
  },
  23: {
    title: "Top Spring Boot Questions",
    concepts: ["Annotations", "Dependency injection", "REST and validation"],
    questions: [
      "What are the most commonly used Spring Boot annotations and what do they do?",
      "Why is constructor injection generally preferred?",
      "How do you validate incoming request data?",
      "How do you structure exception handling in a Spring Boot API?",
      "How would you explain your Spring Boot project architecture?"
    ]
  },
  24: {
    title: "Database Revision",
    concepts: ["Transactions", "Query optimization", "Schema thinking"],
    questions: [
      "How would you identify and improve a slow query?",
      "What are common causes of duplicate or inconsistent data?",
      "What is the difference between normalization and denormalization?",
      "How would you design tables for a typical order system?",
      "When should you use pagination in APIs?"
    ]
  },
  26: {
    title: "Final LLD Pass",
    concepts: ["Classes and objects", "Interfaces", "Design tradeoffs"],
    questions: [
      "How would you model a simple parking lot or library system?",
      "When do you create an interface instead of a concrete class?",
      "How do abstraction and encapsulation show up in your design?",
      "How would you explain low coupling and high cohesion?",
      "How would you improve a tightly coupled design?"
    ]
  },
  27: {
    title: "Full Mock Revision",
    concepts: ["Integrated prep", "Project explanation", "Common weak areas"],
    questions: [
      "Explain your project architecture, APIs, DB, and one design choice.",
      "Answer one Java core question, one Spring Boot question, and one SQL question aloud.",
      "What weak areas kept repeating in mocks?",
      "What short answers do you still need to sharpen?",
      "What topics should you revise tomorrow if an interview is scheduled?"
    ]
  },
  30: {
    title: "Final Flash Revision",
    concepts: ["Java core recap", "Spring recap", "Project recap"],
    questions: [
      "Revise your top 10 Java questions.",
      "Revise your top 10 Spring Boot questions.",
      "Revise your project explanation once more.",
      "Revise DB and JPA weak points.",
      "Write your next revision list based on what still feels shaky."
    ]
  }
};
